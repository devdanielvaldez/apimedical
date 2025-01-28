const Insurance = require("../models/insurances");
const Services = require("../models/services");
const { generateEmbedding } = require("../utils/embeddings");
const routes = require("express").Router();

// Controlador para registrar un seguro médico
const registerInsurance = async (req, res) => {
  try {
    const { insuranceName, contactPhone, services } = req.body;

    // Validar los campos requeridos
    if (!insuranceName || !contactPhone || !services || services.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "Todos los campos (insuranceName, contactPhone, services) son requeridos.",
      });
    }

    // Validar que los servicios existan y que tengan insurancePrice
    const serviceIds = services.map(s => s.service);
    const existingServices = await Services.find({ _id: { $in: serviceIds } });

    if (existingServices.length !== services.length) {
      return res.status(404).json({
        ok: false,
        msg: "Uno o más servicios no existen en la base de datos.",
      });
    }

    const text = `Servicios: ${existingServices}, Nombre del Seguro: ${insuranceName}, Cobertura de servicios por el seguro: ${services}`;
    const embedding = await generateEmbedding(text);

    // Crear el documento de seguro médico
    const insurance = new Insurance({
      insuranceName,
      contactPhone,
      services,
      embedding
    });

    // Guardar en la base de datos
    await insurance.save();

    res.status(201).json({
      ok: true,
      msg: "Seguro médico registrado con éxito.",
      insurance,
    });
  } catch (err) {
    console.error("Error al registrar el seguro médico:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

const getInsurance = async (req, res) => {
    try {
        const data = await Insurance.find()
        .select('-embedding')
        .populate('services.service', '_id serviceName servicePrice serviceWithInsurance');
  
      res.status(201).json({
        ok: true,
        data: data,
      });
    } catch (err) {
      console.error("Error al registrar el seguro médico:", err);
      res.status(500).json({
        ok: false,
        msg: "Error interno del servidor.",
      });
    }
  };

routes.post('/create', registerInsurance);
routes.get('/list', getInsurance);

module.exports = routes;
