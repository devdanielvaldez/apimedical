const BlockDates = require("../models/blockDates");
const routes = require("express").Router();
const { generateEmbedding } = require("../utils/embeddings");

// Controlador para agregar un rango de fecha bloqueada
const addBlockDate = async (req, res) => {
  try {
    const { dateBlock, startTime, endTime, blockAllDay } = req.body;

    // Validar que la fecha esté presente
    if (!dateBlock) {
      return res.status(400).json({
        ok: false,
        msg: "La fecha es obligatoria.",
      });
    }

    // Validar formato de las horas y rango de tiempo
    if (!blockAllDay) {
      if (!startTime || !endTime) {
        return res.status(400).json({
          ok: false,
          msg: "Las horas de inicio y fin son obligatorias.",
        });
      }

      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          ok: false,
          msg: "El formato de las horas debe ser válido (HH:mm).",
        });
      }

      // Validar que startTime sea menor que endTime
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      if (startTotalMinutes >= endTotalMinutes) {
        return res.status(400).json({
          ok: false,
          msg: "La hora de inicio debe ser menor que la hora de fin.",
        });
      }
    }

    // Si es bloqueo de todo el día, asegurarse de que startTime y endTime no estén presentes
    if (blockAllDay && (startTime || endTime)) {
      return res.status(400).json({
        ok: false,
        msg: "No es necesario especificar las horas cuando se bloquea todo el día.",
      });
    }

    // Generar embedding
    const text = `Fecha: ${dateBlock}, Horario: ${startTime || "Todo el día"} - ${endTime || "Todo el día"}, Bloqueo completo: ${blockAllDay}`;
    const embedding = await generateEmbedding(text);

    // Crear un nuevo registro de bloqueo
    const blockDate = new BlockDates({
      dateBlock,
      startTime: blockAllDay ? null : startTime,
      endTime: blockAllDay ? null : endTime,
      blockAllDay,
      embedding,
    });

    await blockDate.save();

    res.status(201).json({
      ok: true,
      message: "Fecha bloqueada registrada con éxito.",
      blockDate,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        ok: false,
        msg: "La combinación de fecha y rango de hora ya está bloqueada.",
      });
    }
    console.error("Error al registrar la fecha bloqueada:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

// Controlador para obtener todas las fechas bloqueadas
const getBlockedDates = async (req, res) => {
  try {
    // Buscar todas las fechas bloqueadas
    const blockedDates = await BlockDates.find().select(
      "_id dateBlock startTime endTime blockAllDay"
    );

    // Verificar si hay fechas bloqueadas
    if (blockedDates.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron fechas bloqueadas.",
      });
    }

    // Enviar respuesta con las fechas bloqueadas
    res.status(200).json({
      ok: true,
      blockedDates,
    });
  } catch (err) {
    console.error("Error al obtener las fechas bloqueadas:", err);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor.",
    });
  }
};

// Rutas
routes.post("/create", addBlockDate);
routes.get("/list", getBlockedDates);

module.exports = routes;