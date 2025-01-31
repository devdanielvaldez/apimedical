const Result = require("../models/results");
const Patient = require("../models/patient");
const { generateEmbedding } = require("../utils/embeddings");
const { default: axios } = require("axios");
const routes = require("express").Router();

const createResult = async (req, res) => {
  try {
    const { patientId, testName, testDate, result, description, pdfPassword } = req.body;

    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
      return res.status(404).json({ error: "El paciente no existe" });
    }

    const text = `Nombre de la Prueba: ${testName}, Fecha de la prueba: ${testDate}, URL del resultado de la prueba: ${result}, Descripcion del resultado: ${description}`;
    const embedding = await generateEmbedding(text);
    const patient = await Patient.findById(patientId).select('-embedding');
    console.log(patient);
    const newResult = new Result({
      patient: patientId,
      testName,
      testDate,
      result,
      description,
      pdfPassword,
      embedding
    });

    await newResult.save();


        axios
          .post('https://bot-ga.medicloudsuite.com/v1/messages', {
            number: `1${patient.whatsAppNumber}`,
            message: `A CONTINUACIÓN LE PRESENTAMOS SUS RESULTADOS:\n\n- Nombre del Resultado: ${testName}\n- Descripción: ${description}\n- Enlace del Resultado: ${result}`
          })
          .then(() => {
            res.status(201).json({
              message: "Resultado creado exitosamente",
              data: newResult,
            });
          })

  } catch (error) {
    console.error("Error al crear el resultado:", error);
    res.status(500).json({ error: "Error al crear el resultado" });
  }
};

const getAllResults = async (req, res) => {
  try {
    const results = await Result.find().select("_id patient testName testDate result description pdfPassword").populate("patient", "firstName lastName");
    res.status(200).json({ data: results });
  } catch (error) {
    console.error("Error al obtener los resultados:", error);
    res.status(500).json({ error: "Error al obtener los resultados" });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id).populate("patient", "name lastName");
    if (!result) {
      return res.status(404).json({ error: "Resultado no encontrado" });
    }

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error al obtener el resultado:", error);
    res.status(500).json({ error: "Error al obtener el resultado" });
  }
};

const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { testName, testDate, result, description } = req.body;

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      { testName, testDate, result, description },
      { new: true, runValidators: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ error: "Resultado no encontrado" });
    }

    res.status(200).json({
      message: "Resultado actualizado exitosamente",
      data: updatedResult,
    });
  } catch (error) {
    console.error("Error al actualizar el resultado:", error);
    res.status(500).json({ error: "Error al actualizar el resultado" });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedResult = await Result.findByIdAndDelete(id);

    if (!deletedResult) {
      return res.status(404).json({ error: "Resultado no encontrado" });
    }

    res.status(200).json({
      message: "Resultado eliminado exitosamente",
      data: deletedResult,
    });
  } catch (error) {
    console.error("Error al eliminar el resultado:", error);
    res.status(500).json({ error: "Error al eliminar el resultado" });
  }
};

routes.post('/create', createResult);
routes.get('/all', getAllResults);
routes.get('/:id', getResultById);
routes.put('/:id', updateResult);
routes.delete('/:id', deleteResult)

module.exports = routes;
