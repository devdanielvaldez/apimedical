const Services = require("../models/services");
const routes = require("express").Router();
const { generateEmbedding } = require("../utils/embeddings");

const addServices = async (req, res) => {
  try {
    const { serviceName, servicePrice, serviceWithInsurance } = req.body;

    if (!serviceName) {
      return res.status(400).json({
        ok: false,
        msg: "El nombre del servicio es requerido.",
      });
    }

    if (!servicePrice) {
        return res.status(400).json({
            ok: false,
            msg: "El costo del servicio es requerido.",
          });
    }

    const text = `Servicio: ${serviceName}, Precio: ${servicePrice}, Precio con Seguro: ${serviceWithInsurance}`;
    const embedding = await generateEmbedding(text);

    const service = new Services({
      serviceName,
      servicePrice: +servicePrice,
      serviceWithInsurance,
      embedding
    });

    await service.save();

    res.status(201).json({
      ok: true,
      message: "Servicio registrado con éxito.",
      service,
    });
  } catch (err) {
    console.error("Error al registrar la fecha bloqueada:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await Services.find().select(
      "_id serviceName servicePrice serviceWithInsurance"
    );

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

routes.post("/create", addServices);
routes.get("/list", getAllServices);

module.exports = routes;