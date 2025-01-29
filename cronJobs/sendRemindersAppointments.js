const cron = require('node-cron');
const Appointments = require('../models/appointment');
const sendWhatsAppMessage = require('../utils/sendWhatsAppMsg');

const sendReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const appointments = await Appointments.find({
      dateAppointment: {
        $gte: new Date(`${tomorrowDate}T00:00:00.000Z`),
        $lt: new Date(`${tomorrowDate}T23:59:59.999Z`),
      },
    }).populate('patientId', 'whatsAppNumber');

    for (const appointment of appointments) {
      const { patientId, dateTimeAppointment } = appointment;

      if (patientId && patientId.whatsAppNumber) {
        const message = `Recordatorio: Tienes una cita mañana a las ${dateTimeAppointment}. ¡No la olvides!`;

        await sendWhatsAppMessage(patientId.whatsAppNumber, message);
      } else {
        console.warn(`El paciente con cita ${appointment._id} no tiene número de WhatsApp registrado.`);
      }
    }

    console.log('Recordatorios enviados exitosamente.');
  } catch (error) {
    console.error('Error enviando recordatorios:', error);
  }
};

const startCronReminders = () => {
    cron.schedule('0 9 * * *', () => {
        console.log('Ejecutando cronjob para enviar recordatorios...');
        sendReminders();
      });
}

module.exports = startCronReminders;