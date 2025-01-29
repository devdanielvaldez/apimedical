const Insurance = require("../models/insurances");
const Services = require("../models/services");
const { generateEmbedding } = require("../utils/embeddings");
const routes = require("express").Router();

const registerInsurance = async (req, res) => {
  try {
    const { insuranceName, contactPhone, services } = req.body;

    if (!insuranceName || !contactPhone || !services || services.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "Todos los campos (insuranceName, contactPhone, services) son requeridos.",
      });
    }

    const serviceIds = services.map((s) => s.service);
    const existingServices = await Services.find({ _id: { $in: serviceIds } });

    if (existingServices.length !== services.length) {
      return res.status(404).json({
        ok: false,
        msg: "Uno o más servicios no existen en la base de datos.",
      });
    }

    const text = `Servicios: ${existingServices}, Nombre del Seguro: ${insuranceName}, Cobertura de servicios por el seguro: ${services}`;
    const embedding = await generateEmbedding(text);

    const insurance = new Insurance({
      insuranceName,
      contactPhone,
      services,
      embedding,
    });

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
    const data = await Insurance.find({ isActive: true })
      .select("-embedding")
      .populate("services.service", "_id serviceName servicePrice serviceWithInsurance");

    res.status(201).json({
      ok: true,
      data: data,
    });
  } catch (err) {
    console.error("Error al obtener los seguros médicos:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

const getInsuranceById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Insurance.findById(id)
      .select("-embedding")
      .populate("services.service", "_id serviceName servicePrice serviceWithInsurance");

    res.status(200).json({
      ok: true,
      data: data,
    });
  } catch (err) {
    console.error("Error al obtener los seguros médicos:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

const getInsuranceById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Insurance.findById(id)
      .select("-embedding")
      .populate("services.service", "_id serviceName servicePrice serviceWithInsurance");

    res.status(200).json({
      ok: true,
      data: data,
    });
  } catch (err) {
    console.error("Error al obtener los seguros médicos:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

const updateInsurance = async (req, res) => {
  try {
    const { id } = req.params;
    const { insuranceName, contactPhone, services } = req.body;

    // Validar que el seguro exista
    const insurance = await Insurance.findById(id);
    if (!insurance || !insurance.isActive) {
      return res.status(404).json({
        ok: false,
        msg: "El seguro médico no existe o ha sido eliminado.",
      });
    }

    if (services && services.length > 0) {
      const serviceIds = services.map((s) => s.service);
      const existingServices = await Services.find({ _id: { $in: serviceIds } });

      if (existingServices.length !== services.length) {
        return res.status(404).json({
          ok: false,
          msg: "Uno o más servicios no existen en la base de datos.",
        });
      }

      const text = `Servicios: ${existingServices}, Nombre del Seguro: ${insuranceName || insurance.insuranceName}, Cobertura de servicios por el seguro: ${services}`;
      insurance.embedding = await generateEmbedding(text);
    }

    insurance.insuranceName = insuranceName || insurance.insuranceName;
    insurance.contactPhone = contactPhone || insurance.contactPhone;
    insurance.services = services || insurance.services;

    await insurance.save();

    res.status(200).json({
      ok: true,
      msg: "Seguro médico actualizado con éxito.",
      insurance,
    });
  } catch (err) {
    console.error("Error al actualizar el seguro médico:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

const deleteInsurance = async (req, res) => {
  try {
    const { id } = req.params;

    const insurance = await Insurance.findById(id);
    if (!insurance || !insurance.isActive) {
      return res.status(404).json({
        ok: false,
        msg: "El seguro médico no existe o ya ha sido eliminado.",
      });
    }

    insurance.isActive = false;
    await insurance.save();

    res.status(200).json({
      ok: true,
      msg: "Seguro médico eliminado con éxito.",
    });
  } catch (err) {
    console.error("Error al eliminar el seguro médico:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

routes.post("/create", registerInsurance);
routes.get("/list", getInsurance);
routes.get("/:id", getInsuranceById);
routes.put("/update/:id", updateInsurance);
routes.delete("/delete/:id", deleteInsurance);

module.exports = routes;
