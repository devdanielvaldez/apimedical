const { default: axios } = require("axios");
const Appointments = require("../models/appointment");
const routes = require("express").Router();
const { generateEmbedding } = require("../utils/embeddings");
const moment = require("moment");
const Patient = require("../models/patient");
const { calculateTotal } = require("../utils/calculateTotal");
const AppointmentDetails = require('../models/appointmentDetails');
const Results = require('../models/results');
const ClinicalHistory = require('../models/clinicalHistory');
const { sendNotification } = require("../socket");

const addAppointment = async (req, res) => {
  try {
    const {
      patientPhoneNumber,
      patientName,
      patientLastName,
      patientWhatsAppNumber,
      address,
      identification,
      insuranceMake,
      patientMotive,
      patientIsInsurante,
      dateAppointment,
      dateTimeAppointment,
      insuranceImage,
      services,
      isWithInsurance,
      bornDate,
      sex,
    } = req.body;

    console.log(req.body);

    // Validar campos obligatorios
    if (!patientPhoneNumber || !patientMotive || !dateAppointment || !dateTimeAppointment) {
      return res.status(400).json({
        ok: false,
        msg: "Faltan campos obligatorios (teléfono, motivo, fecha o hora)",
      });
    }

    let patient = await Patient.findOne({ phoneNumber: patientPhoneNumber });

    if (!patient) {
      // Crear un nuevo paciente si no existe
      const embedding = await generateEmbedding(
        `${patientName} ${patientLastName || ""} - ${patientPhoneNumber} - ${patientWhatsAppNumber || ""} - ${address || ""} - ${identification || ""} - ${insuranceMake || ""} - ${patientIsInsurante || ""} - ${bornDate || ""} - ${sex || ""}`
      );
      const datapatientRegister = {
        firstName: patientName,
        lastName: patientLastName,
        phoneNumber: patientPhoneNumber,
        whatsAppNumber: patientWhatsAppNumber,
        address,
        isInsurance: patientIsInsurante,
        identification,
        insuranceMake,
        insuranceImage,
        embedding,
        bornDate,
        sex,
      };

      if(patientIsInsurante == false) {
        delete datapatientRegister.insuranceMake;
        delete datapatientRegister.insuranceImage;
        delete datapatientRegister.identification;
      }

      patient = new Patient(datapatientRegister);

      await patient.save();
    } else {
      // Verificar si los datos del paciente necesitan actualización
      const updates = {};
      if (patient.firstName !== patientName) updates.firstName = patientName;
      if (patient.lastName !== patientLastName) updates.lastName = patientLastName;
      if (patient.whatsAppNumber !== patientWhatsAppNumber) updates.whatsAppNumber = patientWhatsAppNumber;
      if (patient.address !== address) updates.address = address;
      if (patient.identification !== identification) updates.identification = identification;
      if (patient.insuranceMake !== insuranceMake) updates.insuranceMake = insuranceMake;
      if (patient.isInsurance !== patientIsInsurante) updates.isInsurance = patientIsInsurante;
      if (patient.bornDate !== bornDate) updates.bornDate = bornDate;
      if (patient.sex !== sex) updates.sex = sex;
      if (insuranceImage && patient.insuranceImage !== insuranceImage) updates.insuranceImage = insuranceImage;

      if (Object.keys(updates).length > 0) {
        // Si hay diferencias, realizar la actualización
        const updatedEmbedding = await generateEmbedding(
          `${patientName} ${patientLastName || ""} - ${patientPhoneNumber} - ${patientWhatsAppNumber || ""} - ${address || ""} - ${identification || ""} - ${insuranceMake || ""} - ${patientIsInsurante || ""} - ${bornDate || ""} - ${sex || ""}`
        );
        updates.embedding = updatedEmbedding;

        await Patient.findByIdAndUpdate(patient._id, updates, { new: true });
      }
    }

    // Validar la fecha de la cita
    const appointmentDate = new Date(dateAppointment);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        ok: false,
        msg: "La fecha proporcionada no es válida",
      });
    }

    // Validar el formato de la hora de la cita
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
    if (!timeRegex.test(dateTimeAppointment)) {
      return res.status(400).json({
        ok: false,
        msg: "El formato de la hora no es válido. Debe ser hh:mm AM/PM",
      });
    }

    // Crear una nueva cita
    const appointment = new Appointments({
      patientId: patient._id,
      patientMotive,
      patientIsInsurante,
      dateAppointment: appointmentDate,
      dateTimeAppointment,
      statusAppointment: "PE",
      embedding: await generateEmbedding(
        `${patient.firstName} ${patient.lastName || ""} - ${patientPhoneNumber} - ${dateAppointment} - ${dateTimeAppointment} - ${services}`
      ),
      services,
      isWithInsurance,
    });

    await appointment.save();
    // axios
    //   .post('https://bot.drjenniferreyes.com/v1/messages', {
    //     number: `1${patientWhatsAppNumber}`,
    //     message: `LE NOTIFICAMOS QUE ACABA DE SER AGENDADA Y CONFIRMADA SU CONSULTA CON LA DOCTOR A JENNIFER, A CONTINUACIÓN PRESENTAMOS LOS DATOS: \n\n - FECHA: ${moment(dateAppointment).locale('es-DO').format('LL')}\n\n - HORA: ${dateTimeAppointment}`
    //   })
    //   .then(() => {
    //     axios
    //       .post('https://bot.drjenniferreyes.com/v1/messages', {
    //         number: `18492571779`,
    //         message: `LE NOTIFICAMOS QUE SE ACABA DE AGENDAR UNA NUEVA CITA \n\n- Paciente: ${patientName}`
    //       })
    //       .then(() => {
    //         axios
    //           .post('https://bot.drjenniferreyes.com/v1/messages', {
    //             number: `18296421564`,
    //             message: `LE NOTIFICAMOS QUE SE ACABA DE AGENDAR UNA NUEVA CITA \n\n- Paciente: ${patientName}`
    //           })
    //           .then(() => {
    //             res.status(201).json({ ok: true, message: "Cita agendada con éxito", appointment });

    //           })

    //       })

    //   })

    res.status(201).json({ ok: true, message: "Cita agendada con éxito", appointment });
  } catch (err) {
    console.error("Error en addAppointment:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
routes.post("/create", addAppointment);

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointments.find().select('_id patientMotive patientIsInsurance dateAppointment dateTimeAppointment statusAppointment patientId')
      .populate(
        {
          path: "patientId",
          select: "_id firstName lastName phoneNumber whatsAppNumber address identification insuranceMake isInsurance insuranceImage",
          populate: { path: "insuranceMake", select: "insuranceName" },
      });

    // Si no hay citas
    if (appointments.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No hay citas registradas",
      });
    }

    console.log(appointments);

    const dataResponse = appointments.map((a) => {
      return {
        appointmentId: a._id,
        patientMotive: a.patientMotive,
        dateAppointment: a.dateAppointment,
        dateTimeAppointment: a.dateTimeAppointment,
        statusAppointment: a.statusAppointment,
        firstName: a.patientId.firstName,
        lastName: a.patientId.lastName,
        patientId: a.patientId._id,
        phoneNumber: a.patientId.phoneNumber,
        address: a.patientId.address,
        identification: a.patientId.identification,
        insuranceMake: a.patientId.insuranceMake,
        whatsAppNumber: a.patientId.whatsAppNumber,
        isInsurance: a.patientId.isInsurance,
        insuranceImage: a.patientId.insuranceImage
      };
    });

    res.status(200).json({
      ok: true,
      data: dataResponse,
    });
  } catch (err) {
    console.error("Error al obtener las citas:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
routes.get("/all", getAppointments);

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

routes.put("/change-status/ca/:appointmentId", changeStatusToCA);
routes.put("/change-status/co/:appointmentId", changeStatusToCO);

const calculateAppointmentTotal = async (req, res) => {
  const { servicesIds, insuranceId, isWithInsurance } = req.body;

  try {
    const total = await calculateTotal(servicesIds, insuranceId, isWithInsurance);
    res.status(200).json({ total });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

routes.post('/calculate', calculateAppointmentTotal);

// Controlador para registrar los detalles de la cita
const registerAppointmentDetails = async (req, res) => {
  try {
    const {
      appointmentId,
      physicalExamination,
      currentIllnessHistory,
      labTestsAndDiagnostics,
      diagnoses,
      treatmentPlan,
      progress,
    } = req.body;

    // Validar que appointmentId esté presente
    if (!appointmentId) {
      return res.status(400).json({ error: 'El campo appointmentId es obligatorio.' });
    }

    // Buscar si ya existe un registro con el appointmentId
    const existingDetails = await AppointmentDetails.findOne({ appointmentId });

    if (existingDetails) {
      // Si existe, actualizar el registro
      existingDetails.physicalExamination = {
        vitalSigns: physicalExamination?.vitalSigns || existingDetails.physicalExamination.vitalSigns,
        generalObservation: physicalExamination?.generalObservation || existingDetails.physicalExamination.generalObservation,
        detailedExamination: physicalExamination?.detailedExamination || existingDetails.physicalExamination.detailedExamination,
      };
      existingDetails.currentIllnessHistory = {
        description: currentIllnessHistory?.description || existingDetails.currentIllnessHistory.description,
        onset: currentIllnessHistory?.onset || existingDetails.currentIllnessHistory.onset,
        duration: currentIllnessHistory?.duration || existingDetails.currentIllnessHistory.duration,
        progression: currentIllnessHistory?.progression || existingDetails.currentIllnessHistory.progression,
        triggers: currentIllnessHistory?.triggers || existingDetails.currentIllnessHistory.triggers,
        previousTreatments: currentIllnessHistory?.previousTreatments || existingDetails.currentIllnessHistory.previousTreatments,
      };
      existingDetails.labTestsAndDiagnostics = {
        tests: labTestsAndDiagnostics?.tests || existingDetails.labTestsAndDiagnostics.tests,
        results: labTestsAndDiagnostics?.results || existingDetails.labTestsAndDiagnostics.results,
      };
      existingDetails.diagnoses = {
        presumptive: diagnoses?.presumptive || existingDetails.diagnoses.presumptive,
        definitive: diagnoses?.definitive || existingDetails.diagnoses.definitive,
      };
      existingDetails.treatmentPlan = {
        medications: treatmentPlan?.medications || existingDetails.treatmentPlan.medications,
        therapies: treatmentPlan?.therapies || existingDetails.treatmentPlan.therapies,
        recommendations: treatmentPlan?.recommendations || existingDetails.treatmentPlan.recommendations,
        followUp: treatmentPlan?.followUp || existingDetails.treatmentPlan.followUp,
      };
      existingDetails.progress = {
        currentStatus: progress?.currentStatus || existingDetails.progress.currentStatus,
        milestones: progress?.milestones || existingDetails.progress.milestones,
        notes: progress?.notes || existingDetails.progress.notes,
      };

      // Guardar los cambios en la base de datos
      const updatedDetails = await existingDetails.save();

      return res.status(200).json({
        message: 'Detalles de la cita actualizados con éxito.',
        data: updatedDetails,
      });
    } else {
      // Si no existe, crear un nuevo documento
      const newAppointmentDetails = new AppointmentDetails({
        appointmentId,
        physicalExamination: {
          vitalSigns: physicalExamination?.vitalSigns || {},
          generalObservation: physicalExamination?.generalObservation || '',
          detailedExamination: physicalExamination?.detailedExamination || {},
        },
        currentIllnessHistory: {
          description: currentIllnessHistory?.description || '',
          onset: currentIllnessHistory?.onset || '',
          duration: currentIllnessHistory?.duration || '',
          progression: currentIllnessHistory?.progression || '',
          triggers: currentIllnessHistory?.triggers || '',
          previousTreatments: currentIllnessHistory?.previousTreatments || '',
        },
        labTestsAndDiagnostics: {
          tests: labTestsAndDiagnostics?.tests || [],
          results: labTestsAndDiagnostics?.results || [],
        },
        diagnoses: {
          presumptive: diagnoses?.presumptive || [],
          definitive: diagnoses?.definitive || [],
        },
        treatmentPlan: {
          medications: treatmentPlan?.medications || [],
          therapies: treatmentPlan?.therapies || [],
          recommendations: treatmentPlan?.recommendations || '',
          followUp: treatmentPlan?.followUp || null,
        },
        progress: {
          currentStatus: progress?.currentStatus || '',
          milestones: progress?.milestones || [],
          notes: progress?.notes || '',
        },
      });

      // Guardar los detalles en la base de datos
      const savedDetails = await newAppointmentDetails.save();

      return res.status(201).json({
        message: 'Detalles de la cita registrados con éxito.',
        data: savedDetails,
      });
    }
  } catch (error) {
    console.error('Error registrando los detalles de la cita:', error);
    return res.status(500).json({ error: 'Hubo un error al registrar los detalles de la cita.' });
  }
};
routes.post('/register/details', registerAppointmentDetails);


const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params; // Obtener appointmentId de los parámetros de la solicitud

    // Validar que appointmentId esté presente
    if (!appointmentId) {
      return res.status(400).json({ error: 'El campo appointmentId es obligatorio.' });
    }

    // Buscar los detalles de la cita por appointmentId
    const appointmentDetails = await AppointmentDetails.findOne({ appointmentId: appointmentId });

    // Verificar si se encontraron detalles
    if (!appointmentDetails) {
      return res.status(404).json({ error: 'No se encontraron detalles para esta cita.' });
    }

    // Devolver los detalles encontrados
    return res.status(200).json({
      message: 'Detalles de la cita encontrados con éxito.',
      data: appointmentDetails,
    });
  } catch (error) {
    console.error('Error consultando los detalles de la cita:', error);
    return res.status(500).json({ error: 'Hubo un error al consultar los detalles de la cita.' });
  }
};
routes.get('/details/a/:appointmentId', getAppointmentDetails);


const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointments.findById(id).select('-embedding').populate('patientId', '-embedding').populate('services', '-embedding');

    return res.status(200).json({
      ok: true,
      data: appointment
    });
  } catch (err) {
    console.error('Error registrando los detalles de la cita:', error);
    return res.status(500).json({ error: 'Hubo un error al capturar los detalles de la cita.' });
  }
}
routes.get('/:id', getAppointmentById);

const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointment = await Appointments.find({
      patientId: patientId
    }).select('-embedding').populate('services', '-embedding').populate('patientId', '-embedding')
    const result = await Results.find({
      patient: patientId
    });
    const clinicalHistory = await ClinicalHistory.find({
      patientId: patientId
    });

    return res.status(200).json({
      ok: true,
      data: {
        appointment: appointment,
        results: result,
        clinicalHistory: clinicalHistory
      }
    });
  } catch (err) {
    console.error('Error registrando los detalles de la cita:', error);
    return res.status(500).json({ error: 'Hubo un error al capturar los detalles de la cita.' });
  }
}
routes.get('/details/:patientId', getPatientHistory);

module.exports = routes;
