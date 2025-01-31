const routes = require('express').Router();
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const { GENERAL_INFORMATION } = require('../prompts');
const { generateEmbedding } = require('../utils/embeddings');
const { config } = require('dotenv');
const Appointments = require('../models/appointment');
const AvailableWorkDays = require('../models/availableWorkDates');
const BlockDates = require('../models/blockDates');
config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}
);

const HISTORY_DIR = path.join(__dirname, "conversationHistory");

if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR);
}

function readHistory(phoneNumber) {
    const filePath = path.join(HISTORY_DIR, `${phoneNumber}.json`);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    }
    return [];
}

function saveHistory(phoneNumber, history) {
    const filePath = path.join(HISTORY_DIR, `${phoneNumber}.json`);
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf8");
}

async function AppointmentInfo(question, phone) {
    try {
        const questionEmbedding = await generateEmbedding(`${question} mi telefono es: ${phone}`);

        const appointments = await Appointments.find();
        const cosineSimilarity = (vecA, vecB) => {
            const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
            const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
            const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
            return dotProduct / (magnitudeA * magnitudeB);
        };

        const SIMILARITY_THRESHOLD = 0.6; // Ajustar el umbral si es necesario

        const relevantAppointments = appointments
            .map((p) => ({
                p,
                similarity: cosineSimilarity(questionEmbedding, p.embedding),
            }))
            .filter((result) => result.similarity >= SIMILARITY_THRESHOLD)
            .sort((a, b) => b.similarity - a.similarity);

        if (relevantAppointments.length === 0) {
            return {
                reply: "No encontré coincidencias exactas para tu consulta. ¿Podrías darme más detalles?",
                context: null,
            };
        }

        // console.log("Citas relevantes encontradas:", relevantAppointments);

        const appointmentInfo = relevantAppointments
            .map(
                (p) =>
                    `Nombre del paciente: ${p.p.patientName}\n` +
                    `Teléfono: ${p.p.patientPhoneNumber}\n` +
                    `WhatsApp: ${p.p.patientWhatsAppNumber}\n` +
                    `Motivo: ${p.p.patientMotive}\n` +
                    `¿Es asegurado?: ${p.p.patientIsInsurante ? 'Sí' : 'No'}\n` +
                    `Compañía de seguros: ${p.p.insuranceMake || 'No disponible'}\n` +
                    `Identificación: ${p.p.identification || 'No disponible'}\n` +
                    `Dirección: ${p.p.address || 'No disponible'}\n` +
                    `Fecha de la cita: ${p.p.dateAppointment}\n` +
                    `Hora de la cita: ${p.p.dateTimeAppointment}\n` +
                    `Estado de la cita: ${p.p.statusAppointment === 'CO' ? 'Confirmada' : p.p.statusAppointment === 'PE' ? 'Pendiente' : 'Cancelada'}`
            )
            .join("\n\n");

        // Llamar a OpenAI con solo las citas relevantes
        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres un asistente que ofrece informacion sobre las consultas agendadas en el consultorio de la doctora Gianna Castillo la cual es Pediatra Hematologa, debes buscar si el paciente tiene una cita agendada para poder retornarle toda la información sobre su cita. Retorna solo los datos de la cita si los encontraste. Si el paciente no tiene cita puedes indicarle que puede agendar mediante nuestro portal de agenda el cual es: https://dra-gianna.medicloudsuite.com/appointments/public/create o llamando a nuestro telefono el cual es: +1 (849) 817-1964 las llamadas unicamente dentro de nuestro horario de Lunes a Viernes de 9:00 AM a 5:00 PM. No se pueden agendar citas por whatsapp, si el paciente no tiene cita envialo a la web." },
                {
                    role: "user",
                    content: `Aquí tienes la informacion sobre las citas agendadas ${appointmentInfo}`,
                },
            ],
        });

        const reply = openaiResponse.choices[0].message.content;

        return { reply, context: appointmentInfo };
    } catch (err) {
        console.error(err);
        throw new Error("Error al buscar appointments");
    }
}


async function AvailableWorkDaysInfo(question) {
    try {
        const questionEmbedding = await generateEmbedding(question);

        // Obtiene los días y horarios de trabajo de la doctora
        const workDays = await AvailableWorkDays.find();
        // Obtiene los bloqueos de fechas y horarios
        const blockDates = await BlockDates.find();

        const cosineSimilarity = (vecA, vecB) => {
            const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
            const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
            const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
            return dotProduct / (magnitudeA * magnitudeB);
        };

        const SIMILARITY_THRESHOLD = 0.7;

        // Mapeo los días de la semana y horarios disponibles
        const relevantWorkDays = workDays
            .map(({ dayOfWeek, workHours, embedding }) => ({
                dayOfWeek,
                workHours,
                embedding,
                similarity: cosineSimilarity(questionEmbedding, embedding),
            }))
            .filter((result) => result.similarity >= SIMILARITY_THRESHOLD)
            .sort((a, b) => b.similarity - a.similarity);

        if (relevantWorkDays.length === 0) {
            return {
                reply: "No encontré coincidencias exactas para tu consulta sobre los horarios disponibles. ¿Podrías darme más detalles?",
                context: null,
            };
        }

        // Filtra los días y horarios bloqueados
        const availableDays = relevantWorkDays.map((workDay) => {
            const blockedTimes = blockDates.filter((block) => {
                const blockDate = new Date(block.dateBlock);
                const today = new Date();
                return (
                    blockDate.getDay() === new Date(workDay.dayOfWeek).getDay() &&
                    ((block.startTime && block.endTime) ||
                    block.blockAllDay)
                );
            });

            // Elimina los horarios bloqueados del horario de trabajo disponible
            const availableTimes = workDay.workHours.filter((workHour) => {
                const isBlocked = blockedTimes.some(
                    (block) => block.startTime <= workHour.startTime && block.endTime >= workHour.endTime
                );
                return !isBlocked;
            });

            return {
                dayOfWeek: workDay.dayOfWeek,
                availableTimes,
            };
        });

        // Genera la información de los días y horarios disponibles
        const availableInfo = availableDays
            .map(
                ({ dayOfWeek, availableTimes }) =>
                    `Día: ${dayOfWeek}\nHorarios disponibles:\n` +
                    availableTimes
                        .map(
                            (workHour) =>
                                `Desde: ${workHour.startTime} hasta: ${workHour.endTime}`
                        )
                        .join("\n")
            )
            .join("\n\n");

        console.log(availableInfo);

        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres un asistente que ofrece información sobre los horarios disponibles de la doctora Gianna Castillo, Pediatra Hematologa. Debes mostrar los días y horarios en los que tiene disponibilidad." },
                {
                    role: "user",
                    content: `Aquí tienes la información sobre los horarios disponibles: ${availableInfo}`,
                },
            ],
        });

        const reply = openaiResponse.choices[0].message.content;

        return { reply, context: availableInfo };
    } catch (err) {
        console.error(err);
        throw new Error("Error al buscar los horarios disponibles");
    }
}

const checkAvailableWorkDays = async () => {
    try {
        // Buscar días de trabajo y horarios bloqueados
        const availableWorkDays = await AvailableWorkDays.find();
        const blockedDates = await BlockDates.find();

        // Convertir los horarios bloqueados en un formato más accesible
        const blockedTimes = blockedDates.map(block => ({
            date: block.dateBlock.toLocaleDateString(),
            start: block.startTime,
            end: block.endTime,
            blockAllDay: block.blockAllDay
        }));

        // Filtrar los días de trabajo disponibles
        const availableDays = availableWorkDays.map(day => {
            const blockedDay = blockedTimes.filter(block => new Date(block.date).getDay() === day.dayOfWeek);

            // Verificar si hay algún horario bloqueado en el día
            const availableHours = day.workHours.filter(workHour => {
                return !blockedDay.some(block => {
                    const blockStart = block.start ? block.start : '00:00';
                    const blockEnd = block.end ? block.end : '23:59';

                    // Compara si los horarios de trabajo se superponen con los bloqueados
                    return (
                        (workHour.startTime >= blockStart && workHour.startTime < blockEnd) ||
                        (workHour.endTime > blockStart && workHour.endTime <= blockEnd)
                    );
                });
            });

            return {
                dayOfWeek: day.dayOfWeek,
                availableHours
            };
        });

        // Retornar los días y horarios disponibles
        return availableDays.filter(day => day.availableHours.length > 0);
    } catch (error) {
        console.error('Error al consultar horarios disponibles:', error);
        throw new Error("Error al consultar horarios disponibles");
    }
};

const userChat = async(req, res) => {
    const { phoneNumber, question } = req.body;

	if(phoneNumber == '18498818111') return;

    if (!phoneNumber || !question) {
        return res.status(400).json({ error: "Número de teléfono y pregunta requeridos" });
    }

    try {
        const userHistory = readHistory(phoneNumber);

        const classification = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres un asistente que clasifica preguntas en: citas, consultas, costo, servicios, horarios disponibles." },
                { role: "user", content: `Clasifica la siguiente pregunta: "${question}"` },
            ],
        });

        const category = classification.choices[0].message.content.trim().toLowerCase();

        let context = "";
        let reply = "";

        if (category.includes("citas") || category.includes("consultas")) {
            const { reply: appointmentReply, context: appointmentContext } = await AppointmentInfo(question, phoneNumber);

            reply = appointmentReply;
            context = appointmentContext;
        } else if (category.includes("servicios") || category.includes("costo")) {
            const messages = [
                { role: "system", content: `"La doctora Gianna Castillo sus consultas se encuentran en 2,000 para asegurados y 2,500 pesos dominicanos para pacientes privados (no asegurados)
                "` },
                ...userHistory,
                { role: "user", content: `Pregunta: ${question}` },
            ];

            if (context) {
                messages.push({ role: "system", content: `${GENERAL_INFORMATION}. ESTA ES LA INFORMACIÓN ENCONTRADA, ANALIZALA Y RETORNA LA MEJOR RESPUESTA AL USUARIO:\n\n${context}` });
            }

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages,
            });

            const finalReply = response.choices[0].message.content;

            userHistory.push({ role: "user", content: question });
            userHistory.push({ role: "assistant", content: finalReply });
            saveHistory(phoneNumber, userHistory);

            return res.json({ reply: finalReply, context, category: category });
        } else if (category.includes('horarios disponibles')) {
            // Consultar horarios disponibles
            const availableWorkDays = await checkAvailableWorkDays();

            if (availableWorkDays.length > 0) {
                reply = `Los horarios disponibles para la doctora Gianna son los siguientes:\n\n` +
                        availableWorkDays.map(day => 
                            `${day.dayOfWeek}: ${day.availableHours.map(hour => `${hour.startTime} - ${hour.endTime}`).join(', ')}`
                        ).join('\n');
            } else {
                reply = "No hay horarios disponibles para la doctora Gianna en este momento.";
            }

            context = "Horarios disponibles";
        } else {
            // Ingresar toda la informacion de la empresa
        }

        const messages = [
            { role: "system", content: GENERAL_INFORMATION },
            ...userHistory,
            { role: "user", content: `Pregunta: ${question}` },
        ];

        if (context) {
            messages.push({ role: "system", content: `ESTA ES LA INFORMACIÓN ENCONTRADA, ANALIZALA Y RETORNA LA MEJOR RESPUESTA AL USUARIO:\n\n${context}` });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        });

        const finalReply = response.choices[0].message.content;

        userHistory.push({ role: "user", content: question });
        userHistory.push({ role: "assistant", content: finalReply });
        saveHistory(phoneNumber, userHistory);

        res.json({ reply: finalReply, context, category: category });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al procesar la consulta" });
    }
}


routes.post('/init', userChat);

module.exports = routes;
