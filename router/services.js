const Services = require("../models/services");
const routes = require("express").Router();
const { generateEmbedding } = require("../utils/embeddings");

// Controlador para agregar un rango de fecha bloqueada
const addServices = async (req, res) => {
  try {
    const { serviceName, servicePrice } = req.body;

    // Validar que la fecha esté presente
    if (!serviceName) {
      return res.status(400).json({
        ok: false,
        msg: "El nombre del servicio es requerido.",
      });
    }

    // Validar formato de las horas y rango de tiempo
    if (!servicePrice) {
        return res.status(400).json({
            ok: false,
            msg: "El costo del servicio es requerido.",
          });
    }


    // Generar embedding
    const text = `Servicio: ${serviceName}, Precio: ${servicePrice}`;
    const embedding = await generateEmbedding(text);

    // Crear un nuevo registro de bloqueo
    const service = new Services({
      serviceName,
      servicePrice: +servicePrice,
      embedding
    });

    await service.save();

    res.status(201).json({
      ok: true,
      message: "Servicio registrado con éxito.",
      blockDate,
    });
  } catch (err) {
    console.error("Error al registrar la fecha bloqueada:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

// Controlador para obtener todas las fechas bloqueadas
const getAllServices = async (req, res) => {
  try {
    // Buscar todas las fechas bloqueadas
    const services = await Services.find().select(
      "_id serviceName servicePrice"
    );


    // Enviar respuesta con las fechas bloqueadas
    res.status(200).json({
      ok: true,
      services,
    });
  } catch (err) {
    console.error("Error al obtener los servicios:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

// Rutas
routes.post("/create", addServices);
routes.get("/list", getAllServices);

module.exports = routes;