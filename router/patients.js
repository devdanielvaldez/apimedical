const Patient = require('../models/patient');
const routes = require("express").Router();

const findPatientByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validar que el número de teléfono sea proporcionado
    if (!phoneNumber) {
      return res.status(400).json({
        ok: false,
        msg: "El número de teléfono es obligatorio",
      });
    }


    // Buscar paciente por número de teléfono
    const patient = await Patient.findOne({ phoneNumber }).select('_id firstName lastName phoneNumber whatsAppNumber address identification insuranceMake isInsurance insuranceImage bornDate sex');

    if (patient) {
      // Si el paciente existe, devolver sus datos
      return res.status(200).json({
        ok: true,
        message: "Paciente encontrado",
        patient,
      });
    }

    // Si el paciente no existe
    return res.status(404).json({
      ok: false,
      message: "Paciente no encontrado",
    });
  } catch (err) {
    console.error("Error en findPatientByPhone:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({
    }).select('_id firstName lastName phoneNumber whatsAppNumber address identification insuranceMake isInsurance insuranceImage bornDate sex');

    return res.status(200)
      .json({
        ok: true,
        data: patients
      });
  } catch (err) {
    console.error("Error en findPatient:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

const findPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patients = await Patient.findById(id).select('_id firstName lastName phoneNumber whatsAppNumber address identification insuranceMake isInsurance insuranceImage bornDate sex');

    return res.status(200)
      .json({
        ok: true,
        data: patients
      });
  } catch (err) {
    console.error("Error en findPatient:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};


routes.get('/find/all', getAllPatients);
routes.get('/find/:id', findPatientById);
routes.post('/find', findPatientByPhone);

module.exports = routes;