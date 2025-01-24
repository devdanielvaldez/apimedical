const ClinicalHistory = require('../models/clinicalHistory'); // Importa el modelo de historia clínica
const Patient = require('../models/patient'); // Importa el modelo de pacientes
const { generateEmbedding } = require('../utils/embeddings');
const router = require('express').Router();
const OpenAI = require("openai");
const { config } = require('dotenv');
config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}
);

// Controlador para crear la historia clínica
const createOrUpdateClinicalHistory = async (req, res) => {
    try {
        const {
            patientId,
            medicalHistory,
            lifestyle,
            physicalExam,
            currentIllness,
            labTests,
            diagnoses,
            treatmentPlan
        } = req.body;

        const embedding = await generateEmbedding(
            `${medicalHistory} - ${lifestyle} - ${physicalExam} - ${currentIllness} - ${labTests} - ${diagnoses} - ${treatmentPlan}`
        );

        // Verificar que el ID del paciente es válido
        if (!patientId) {
            return res.status(400).json({
                ok: false,
                message: 'El ID del paciente es obligatorio.'
            });
        }

        // Verificar que el paciente exista
        const patientExists = await Patient.findById(patientId);
        if (!patientExists) {
            return res.status(404).json({
                ok: false,
                message: 'El paciente no existe.'
            });
        }

        // Datos a actualizar o crear
        const clinicalHistoryData = {
            patientId,
            medicalHistory: {
                personal: {
                    diseases: medicalHistory?.personal?.diseases || [],
                    surgeries: medicalHistory?.personal?.surgeries || [],
                    allergies: medicalHistory?.personal?.allergies || [],
                    medications: medicalHistory?.personal?.medications || [],
                    hospitalizations: medicalHistory?.personal?.hospitalizations || [],
                    vaccines: medicalHistory?.personal?.vaccines || [],
                },
                family: {
                    hereditaryDiseases: medicalHistory?.family?.hereditaryDiseases || [],
                    familyHistory: medicalHistory?.family?.familyHistory || [],
                },
            },
            lifestyle: {
                diet: lifestyle?.diet || '',
                physicalActivity: lifestyle?.physicalActivity || '',
                substanceUse: lifestyle?.substanceUse || '',
                sleep: lifestyle?.sleep || '',
                stressLevel: lifestyle?.stressLevel || '',
                socialRelationships: lifestyle?.socialRelationships || '',
            },
            physicalExam: {
                vitalSigns: physicalExam?.vitalSigns || '',
                general: physicalExam?.general || '',
                systems: physicalExam?.systems || '',
            },
            currentIllness: {
                description: currentIllness?.description || '',
                onset: currentIllness?.onset || '',
                duration: currentIllness?.duration || '',
                progression: currentIllness?.progression || '',
                triggers: currentIllness?.triggers || '',
                priorTreatments: currentIllness?.priorTreatments || ''
            },
            labTests: labTests || [], // Asegúrate de que esto sea un array
            diagnoses: diagnoses || [], // Asegúrate de que esto sea un array
            treatmentPlan: {
                medications: treatmentPlan?.medications || [],
                therapies: treatmentPlan?.therapies || [],
                recommendations: treatmentPlan?.recommendations || '',
                followUp: treatmentPlan?.followUp || ''
            },
            embedding
        };

        // Buscar si ya existe una historia clínica y actualizarla, si no, crearla
        const updatedClinicalHistory = await ClinicalHistory.findOneAndUpdate(
            { patientId }, // Condición para buscar por ID del paciente
            clinicalHistoryData, // Datos para actualizar
            { new: true, upsert: true } // Crear si no existe y devolver el documento actualizado
        );

        // Enviar la respuesta al cliente
        res.status(200).json({
            ok: true,
            message: 'Historia clínica actualizada o creada con éxito.',
            clinicalHistory: updatedClinicalHistory
        });
    } catch (error) {
        console.error('Error al crear o actualizar la historia clínica:', error);
        res.status(500).json({
            ok: false,
            message: 'Error interno del servidor.',
            error: error.message // Agrega el mensaje de error para más detalles
        });
    }
};
router.post('/create', createOrUpdateClinicalHistory);

const updateClinicalHistory = async (req, res) => {
    try {
        const { id } = req.params; // ID de la historia clínica
        const updates = req.body; // Nuevos datos para actualizar

        if (!id) {
            return res.status(400).json({
                ok: false,
                msg: "El ID de la historia clínica es requerido.",
            });
        }

        // Buscar y actualizar la historia clínica
        const updatedClinicalHistory = await ClinicalHistory.findByIdAndUpdate(
            id,
            updates,
            { new: true } // Retorna el documento actualizado
        );

        if (!updatedClinicalHistory) {
            return res.status(404).json({
                ok: false,
                msg: "Historia clínica no encontrada.",
            });
        }

        res.status(200).json({
            ok: true,
            msg: "Historia clínica actualizada con éxito.",
            clinicalHistory: updatedClinicalHistory,
        });
    } catch (error) {
        console.error("Error al actualizar la historia clínica:", error);
        res.status(500).json({
            ok: false,
            msg: "Error interno del servidor.",
        });
    }
};
router.put('/update/:id', updateClinicalHistory);

const getClinicalHistory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                ok: false,
                msg: "El ID del paciente es requerido.",
            });
        }

        const clinicalHistory = await ClinicalHistory.findOne({ patientId: id }).populate('patientId');

        if (!clinicalHistory) {
            return res.status(404).json({
                ok: false,
                msg: "Historia clínica no encontrada.",
            });
        }

        res.status(200).json({
            ok: true,
            clinicalHistory,
        });
    } catch (error) {
        console.error("Error al obtener la historia clínica:", error);
        res.status(500).json({
            ok: false,
            msg: "Error interno del servidor.",
        });
    }
};
router.get('/:id', getClinicalHistory);

async function analyzeClinicalHistory(embedding) {
    try {
        const prompt = `
Eres un asistente médico que proporciona análisis de historias clínicas. A continuación se presenta la historia clínica de un paciente:

**Datos del Paciente:**
- Nombre: ${embedding.patientId.firstName} ${embedding.patientId.lastName}
- Teléfono: ${embedding.patientId.phoneNumber}
- Dirección: ${embedding.patientId.address}
- Fecha de Nacimiento: ${embedding.patientId.bornDate}
- Sexo: ${embedding.patientId.sex}

**Historia Médica:**
- Enfermedades: ${embedding.medicalHistory.personal.diseases.join(', ')}
- Cirugías: ${embedding.medicalHistory.personal.surgeries.join(', ')}
- Alergias: ${embedding.medicalHistory.personal.allergies.join(', ')}
- Medicamentos: ${embedding.medicalHistory.personal.medications.join(', ')}
- Hospitalizaciones: ${embedding.medicalHistory.personal.hospitalizations.join(', ')}
- Vacunas: ${embedding.medicalHistory.personal.vaccines.join(', ')}
- Enfermedades Hereditarias: ${embedding.medicalHistory.family.hereditaryDiseases.join(', ')}
- Historia Familiar: ${embedding.medicalHistory.family.familyHistory.join(', ')}

**Estilo de Vida:**
- Dieta: ${embedding.lifestyle.diet}
- Actividad Física: ${embedding.lifestyle.physicalActivity}
- Uso de Sustancias: ${embedding.lifestyle.substanceUse}
- Sueño: ${embedding.lifestyle.sleep}
- Nivel de Estrés: ${embedding.lifestyle.stressLevel}
- Relaciones Sociales: ${embedding.lifestyle.socialRelationships}

**Examen Físico:**
- Signos Vitales: ${embedding.physicalExam.vitalSigns}
- General: ${embedding.physicalExam.general}
- Sistemas: ${embedding.physicalExam.systems}

**Enfermedad Actual:**
- Descripción: ${embedding.currentIllness.description}
- Inicio: ${embedding.currentIllness.onset}
- Duración: ${embedding.currentIllness.duration}
- Progresión: ${embedding.currentIllness.progression}
- Desencadenantes: ${embedding.currentIllness.triggers}
- Tratamientos Previos: ${embedding.currentIllness.priorTreatments}

**Plan de Tratamiento:**
- Medicamentos: ${embedding.treatmentPlan.medications.join(', ')}
- Terapias: ${embedding.treatmentPlan.therapies.join(', ')}
- Recomendaciones: ${embedding.treatmentPlan.recommendations}
- Seguimiento: ${embedding.treatmentPlan.followUp}

Por favor, proporciona un análisis detallado de esta historia clínica, incluyendo posibles diagnósticos, recomendaciones y cualquier otra información relevante.
`;
        // Llamar a la API de OpenAI con el embedding de la historia clínica
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // O el modelo que prefieras
            messages: [
                {
                    role: 'system',
                    content: `"
                        Eres un asistente médico especializado en análisis de historias clínicas. Tu tarea es resumir la historia clínica del paciente y detallar su progreso (si existe) o retroceso (si aplica), sin proporcionar sugerencias ni tratamientos.

                        El resumen debe ser claro y redactado con terminología médica profesional, estructurado de manera que facilite la comprensión rápida por parte del médico. Incluye todos los datos relevantes de la historia clínica en un formato compacto y bien organizado.
                        Genera el contenido con etiquetas HTML para presentarlo dentro de un div, asegurándote de:

                        - Títulos destacados: Utiliza etiquetas HTML como <b> para resaltar títulos.
                        - Formato limpio: Mantén todo el texto en una sola línea (sin saltos de línea innecesarios).
                        - Sin estilos adicionales: No agregues fondos, bordes, espaciados (padding/margin), ni estilos de diseño como colores.
                        - Enfoque médico: Presenta la información en términos clínicos precisos y enfocados, para que el médico comprenda rápidamente el caso.
                        
                        Por favor, mantén el contenido eficiente y profesional.
                    "`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 1100, // Ajusta según el tamaño de la respuesta que necesites
            temperature: 0.7,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error analizando la historia clínica:', error);
        throw new Error('Error al obtener el análisis');
    }
}

// Controlador para manejar la solicitud
const analyzeHistoryController = async (req, res) => {
    try {
        const { embedding } = req.body;

        if (!embedding) {
            return res.status(400).json({ error: 'Falta el embedding en la solicitud.' });
        }

        // Llamar a la función de análisis
        const analysis = await analyzeClinicalHistory(embedding);

        return res.status(200).json({ analysis });
    } catch (error) {
        return res.status(500).json({ error: 'Hubo un error procesando la solicitud.' });
    }
};

router.post('/analyze', analyzeHistoryController);


module.exports = router;
