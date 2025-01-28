const cron = require("node-cron");
const Appointments = require("../models/appointment");
const TemporaryQueue = require("../models/turns");
const Padron = require("../entity/Padron");
const Nacionalidad = require("../entity/Nacionality");
const coneccion = require("../connection-typeorm");

const registerAppointmentsInQueueJob = () => {
    // cron.schedule("*/6 * * * * *", async () => {
    //     try {
    //         const repositoryPadron = coneccion.getRepository(Padron);
    //         const data = await repositoryPadron.find({ take: 10, relations:{nacionalidad: true, municipio: {provincia: true}} });
    //         console.log("⏰ datos de padron", data);

    //         console.log("⏰ Ejecutando job para registrar nuevas citas...");

    //         // Calcular el rango del día en UTC
    //         const now = new Date(); // Fecha actual
    //         const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)); // Inicio del día UTC
    //         const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)); // Fin del día UTC

    //         console.log(`📅 Rango UTC del día: ${todayStart.toISOString()} - ${todayEnd.toISOString()}`);

    //         // Buscar citas pendientes dentro del rango UTC
    //         const appointments = await Appointments.find({
    //             dateAppointment: {
    //                 $gte: todayStart,
    //                 $lte: todayEnd,
    //             },
    //             statusAppointment: "PE",
    //         });

    //         console.log(`\n\n📋 Citas encontradas: ${appointments.length}`);

    //         // Obtener IDs de las citas ya registradas en la tabla temporal
    //         const registeredAppointments = await TemporaryQueue.find().select("appointmentId");
    //         const registeredIds = registeredAppointments.map((item) => item.appointmentId.toString());

    //         console.log(`📋 Citas ya registradas: ${registeredIds.length}`);

    //         // Filtrar las nuevas citas que aún no están en la tabla temporal
    //         const newAppointments = appointments.filter(
    //             (appointment) => !registeredIds.includes(appointment._id.toString())
    //         );

    //         console.log(`🆕 Nuevas citas para registrar: ${newAppointments.length}`);

    //         // Registrar las nuevas citas en la tabla temporal
    //         const queuePromises = newAppointments.map((appointment) =>
    //             TemporaryQueue.create({ appointmentId: appointment._id })
    //         );
    //         await Promise.all(queuePromises);

    //         if (newAppointments.length > 0) {
    //             console.log(`✅ Se registraron ${newAppointments.length} nuevas citas en la cola temporal.\n\n`);
    //         } else {
    //             console.log("📋 No hay nuevas citas para registrar.\n\n");
    //         }
    //     } catch (error) {
    //         console.error("❌ Error ejecutando el job:", error.message, error);
    //     }
    // });
};


module.exports = registerAppointmentsInQueueJob;