const AvailableWorkDays = require("../models/availableWorkDates");
const routes = require("express").Router();
const { generateEmbedding } = require("../utils/embeddings");

// Controlador para agregar días laborales disponibles
const addAvailableWorkDay = async (req, res) => {
  try {
    const { dayOfWeek, workHours } = req.body;

    // Validar que el día y horarios estén presentes
    if (!dayOfWeek || !workHours || !Array.isArray(workHours) || workHours.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "Debe proporcionar un día de la semana y al menos un horario de trabajo.",
      });
    }

    // Validar que los horarios tengan formato correcto y lógica coherente
    for (const { startTime, endTime } of workHours) {
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(endTime)) {
        return res.status(400).json({
          ok: false,
          msg: "Los horarios deben estar en formato válido (HH:mm).",
        });
      }
      // if (startTime >= endTime) {
      //   return res.status(400).json({
      //     ok: false,
      //     msg: `El horario de inicio (${startTime}) debe ser anterior al horario de fin (${endTime}).`,
      //   });
      // }
    }

    // Generar embedding
    const text = `${dayOfWeek} - ${workHours.map((h) => `${h.startTime}-${h.endTime}`).join(", ")}`;
    const embedding = await generateEmbedding(text);

    // Crear o actualizar el día laboral disponible
    const availableWorkDay = await AvailableWorkDays.findOneAndUpdate(
      { dayOfWeek },
      { dayOfWeek, workHours, embedding },
      { new: true, upsert: true } // Crea un nuevo documento si no existe
    );

    res.status(201).json({
      ok: true,
      message: "Día laboral disponible registrado con éxito.",
      availableWorkDay,
    });
  } catch (err) {
    console.error("Error al registrar el día laboral disponible:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

// Rutas
routes.post("/create", addAvailableWorkDay);

// Controlador para obtener los días laborales disponibles
const getAvailableWorkDays = async (req, res) => {
  try {
    // Buscar todos los días laborales disponibles
    const availableWorkDays = await AvailableWorkDays.find().select('_id dayOfWeek workHours');

    if (availableWorkDays.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron días laborales disponibles.",
      });
    }

    res.status(200).json({
      ok: true,
      availableWorkDays,
    });
  } catch (err) {
    console.error("Error al obtener los días laborales disponibles:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

// Ruta para obtener los días laborales disponibles
routes.get("/list", getAvailableWorkDays);

module.exports = routes;


module.exports = routes;
