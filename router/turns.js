const TemporaryQueue = require("../models/turns");
const Appointments = require("../models/appointment");
const { sendNotification } = require("../socket");
const routes = require("express").Router();

const getAllTurns = async (req, res) => {
    try {
        const turns = await TemporaryQueue.find()
            .populate({
                path: "appointmentId",
                populate: { path: "patientId", select: "firstName lastName" },
            })
            .sort({ arrivalTime: 1 });

        res.status(200).json({
            success: true,
            data: turns,
        });
    } catch (error) {
        console.error("Error al obtener los turnos:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al obtener los turnos.",
        });
    }
};
routes.get('/all', getAllTurns);

const getTurnById = async (req, res) => {
    try {
        const { id } = req.params;
        const turn = await TemporaryQueue.find({
            appointmentId: id
        });

        return res.status(200)
        .json({
            ok: true,
            data: turn
        });
    } catch(err) {
        console.error("Error al obtener los turnos:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al obtener los turnos.",
        });
    }
}
routes.get('/:id', getTurnById);

const confirmTurn = async (req, res) => {
    const { turnId } = req.params;

    try {
        const turn = await TemporaryQueue.findById(turnId).populate("appointmentId");
        console.log(turn);

        if (!turn) {
            return res.status(404).json({
                success: false,
                message: "Turno no encontrado.",
            });
        }

        turn.confirmed = true;
        turn.arrivalTime = new Date();
        await turn.save();

        const appointment = await Appointments.findById(turn.appointmentId._id);
        if (appointment) {
            appointment.statusAppointment = "COF";
            await appointment.save();
        }
        sendNotification("Se acaba de confirmar un turno.");
        res.status(200).json({
            success: true,
            message: "Turno confirmado exitosamente.",
            data: turn,
        });
    } catch (error) {
        console.error("Error al confirmar el turno:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al confirmar el turno.",
        });
    }
};
routes.get('/confirm/:turnId', confirmTurn);

const markTurnAsInProgress = async (req, res) => {
    const { turnId } = req.params;

    try {
        const turn = await TemporaryQueue.findById(turnId);

        if (!turn) {
            return res.status(404).json({
                success: false,
                message: "Turno no encontrado.",
            });
        }

        turn.isInProgress = true;
        await turn.save();

        const appointment = await Appointments.findById(turn.appointmentId._id);
        if (appointment) {
            appointment.statusAppointment = "IN";
            await appointment.save();
        }

        res.status(200).json({
            success: true,
            message: "Turno marcado como EN CURSO.",
            data: turn,
        });
    } catch (error) {
        console.error("Error al marcar el turno como EN CURSO:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al marcar el turno como EN CURSO.",
        });
    }
};
routes.get('/in_progress/:turnId', markTurnAsInProgress)


const markTurnAsCompleted = async (req, res) => {
    const { turnId } = req.params;

    try {
        const turn = await TemporaryQueue.findById(turnId).populate("appointmentId");

        if (!turn) {
            return res.status(404).json({
                success: false,
                message: "Turno no encontrado.",
            });
        }

        const appointment = await Appointments.findById(turn.appointmentId._id);
        if (appointment) {
            appointment.statusAppointment = "CO";
            await appointment.save();
        }

        await turn.deleteOne({
            _id: turnId
        });

        res.status(200).json({
            success: true,
            message: "Turno marcado como COMPLETADO y eliminado de la cola.",
        });
    } catch (error) {
        console.error("Error al marcar el turno como COMPLETADO:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al marcar el turno como COMPLETADO.",
        });
    }
};
routes.get('/complete/:turnId', markTurnAsCompleted);

module.exports = routes;