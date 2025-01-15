const { default: axios } = require("axios");
const Appointments = require("../models/appointment");
const routes = require("express").Router();
const { generateEmbedding } = require("../utils/embeddings");
const moment = require("moment");

const addAppointment = async (req, res) => {
  try {
    const {
      patientName,
      patientPhoneNumber,
      patientWhatsAppNumber,
      patientMotive,
      patientIsInsurante,
      insuranceMake,
      identification,
      insuranceImage,
      address,
      dateAppointment,
      dateTimeAppointment
    } = req.body;

    // Validar campos obligatorios
    if (!patientName || !patientPhoneNumber || !dateAppointment || !dateTimeAppointment) {
      return res.status(400).json({
        ok: false,
        msg: "Faltan campos obligatorios (nombre, teléfono, fecha o hora)",
      });
    }

    // Validar formato de fecha
    const appointmentDate = new Date(dateAppointment);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        ok: false,
        msg: "La fecha proporcionada no es válida",
      });
    }

    // Validar formato de hora (HH:mm)
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
    if (!timeRegex.test(dateTimeAppointment)) {
      return res.status(400).json({
        ok: false,
        msg: "El formato de la hora no es válido. Debe ser HH:mm",
      });
    }

    // Generar embedding para la cita
    const text = `${patientName} - ${patientPhoneNumber} - ${patientWhatsAppNumber} - ${patientMotive} - ${patientIsInsurante} - ${insuranceMake} - ${identification} - ${address} - ${dateAppointment} - ${dateTimeAppointment} - PE`;
    const embedding = await generateEmbedding(text);

    // Crear y guardar la cita
    const appointment = new Appointments({
      patientName,
      patientPhoneNumber,
      patientWhatsAppNumber,
      patientMotive,
      patientIsInsurante,
      insuranceMake,
      identification,
      insuranceImage,
      address,
      dateAppointment: appointmentDate, // Guardar como objeto de fecha
      dateTimeAppointment,
      statusAppointment: "PE",
      embedding,
    });

    await appointment.save();

    axios
    .post('https://bot.drjenniferreyes.com/v1/messages', {
      number: `1${patientWhatsAppNumber}`,
      message: `LE NOTIFICAMOS QUE ACABA DE SER AGENDADA Y CONFIRMADA SU CONSULTA CON LA DOCTOR A JENNIFER, A CONTINUACIÓN PRESENTAMOS LOS DATOS: \n\n - FECHA: ${moment(dateAppointment).locale('es-DO').format('LL')}\n\n - HORA: ${dateTimeAppointment}`
    })
    .then(() => {
      res.status(201).json({ ok: true, message: "Cita agendada con éxito", appointment });

    })
  } catch (err) {
    console.error("Error al registrar la cita:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

routes.post("/create", addAppointment);

const getAppointments = async (req, res) => {
    try {
      const appointments = await Appointments.find().select('_id patientName patientPhoneNumber patientWhatsAppNumber patientMotive patientInsurance insuranceMake identification insuranceImage address dateAppointment dateTimeAppointment statusAppointment'); // Obtiene todas las citas de la base de datos
  
      // Si no hay citas
      if (appointments.length === 0) {
        return res.status(404).json({
          ok: false,
          msg: "No hay citas registradas",
        });
      }
  
      res.status(200).json({
        ok: true,
        appointments, // Retorna todas las citas
      });
    } catch (err) {
      console.error("Error al obtener las citas:", err);
      res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
      });
    }
  };
  
  // Endpoint para obtener todas las citas
routes.get("/all", getAppointments);

// Función para cambiar el estado a "CA"
const changeStatusToCA = async (req, res) => {
    try {
      const { appointmentId } = req.params; // El id de la cita se pasa por URL
  
      const appointment = await Appointments.findById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({
          ok: false,
          msg: "Cita no encontrada",
        });
      }
  
      appointment.statusAppointment = "CA"; // Cambiar el estado a "CA"
      await appointment.save(); // Guardar el cambio en la base de datos
  
      res.status(200).json({
        ok: true,
        msg: "Estado de la cita cambiado a 'CA'",
        appointment,
      });
    } catch (err) {
      console.error("Error al cambiar el estado de la cita:", err);
      res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
      });
    }
  };
  
  // Función para cambiar el estado a "CO"
  const changeStatusToCO = async (req, res) => {
    try {
      const { appointmentId } = req.params; // El id de la cita se pasa por URL
  
      const appointment = await Appointments.findById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({
          ok: false,
          msg: "Cita no encontrada",
        });
      }
  
      appointment.statusAppointment = "CO"; // Cambiar el estado a "CO"
      await appointment.save(); // Guardar el cambio en la base de datos
  
      res.status(200).json({
        ok: true,
        msg: "Estado de la cita cambiado a 'CO'",
        appointment,
      });
    } catch (err) {
      console.error("Error al cambiar el estado de la cita:", err);
      res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
      });
    }
  };
  
  // Rutas para cambiar el estado de la cita
  routes.put("/change-status/ca/:appointmentId", changeStatusToCA); // Cambiar a CA
  routes.put("/change-status/co/:appointmentId", changeStatusToCO); // Cambiar a CO

module.exports = routes;
