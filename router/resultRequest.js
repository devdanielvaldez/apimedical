const ResultRequest = require("../models/resultRequest");
const router = require('express').Router();

const createRequest = async (req, res) => {
  try {
    const { resultName, description, patient } = req.body;

    if (!resultName || !patient) {
      return res.status(400).json({ message: "resultName y patient son obligatorios" });
    }

    const newRequest = new ResultRequest({
      resultName,
      description,
      patient,
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la solicitud", error: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await ResultRequest.find().populate("patient");
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las solicitudes", error: error.message });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await ResultRequest.findById(req.params.id).populate("patient");
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la solicitud", error: error.message });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const request = await ResultRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    if (request.status === "C") {
      return res.status(400).json({ message: "No se puede eliminar una solicitud ya cargada" });
    }

    await request.deleteOne();
    res.status(200).json({ message: "Solicitud eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la solicitud", error: error.message });
  }
};

const uploadResult = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: "fileUrl es obligatorio" });
    }

    const request = await ResultRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    if (request.status === "C") {
      return res.status(400).json({ message: "El resultado ya fue cargado" });
    }

    request.status = "C";
    request.fileUrl = fileUrl;
    request.uploadDate = new Date();

    await request.save();
    res.status(200).json({ message: "Resultado guardado correctamente", request });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar el resultado", error: error.message });
  }
};

router.post('/create', createRequest);
router.get('/all', getAllRequests);
router.get('/:id', getRequestById);
router.delete('/:id', deleteRequest);
router.post('/upload/:id', uploadResult);

module.exports = router;