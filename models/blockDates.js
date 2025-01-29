const mongoose = require("mongoose");

const BlockDatesSchema = new mongoose.Schema({
  dateBlock: {
    type: Date,
    required: true, // Este campo siempre es obligatorio
  },
  startTime: {
    type: String, // Hora de inicio en formato HH:mm
    required: false, // Es obligatorio registrar la hora de inicio
  },
  endTime: {
    type: String, // Hora de fin en formato HH:mm
    required: false, // Es obligatorio registrar la hora de fi
  },
  blockAllDay: {
    type: Boolean,
    default: false, // Por defecto no bloquea todo el día
  },
  embedding: {
    type: [Number],
    required: true,
  }, 
    deletedAt: { // Fecha de eliminación
      type: Date,
      default: null
    },
    branchOfficeId: { // Sucursal a la que pertenece
      type: mongoose.Schema.Types.ObjectId,
      ref: "BranchOffices",
      required: true,
    },
    userCreator: { // Usuario que crea el registro
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    userUpdates: { // Usuario que modifica el registro
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false,
    },
    createdAt: { // Fecha de creación
      type: Date,
      default: Date.now,
    },
    updatedAt: { // Fecha de modificación
      type: Date,
      default: null,
    }
});

// Validación adicional: asegura que la hora de inicio sea menor que la hora de fin
BlockDatesSchema.pre("validate", function (next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMinute] = this.startTime.split(":").map(Number);
    const [endHour, endMinute] = this.endTime.split(":").map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (startTotalMinutes >= endTotalMinutes) {
      return next(new Error("La hora de inicio debe ser menor que la hora de fin"));
    }
  }
  next();
});

BlockDatesSchema.index({ dateBlock: 1, startTime: 1, endTime: 1 }, { unique: true }); // Evita duplicados de fecha + rango de hora

module.exports = mongoose.model("BlockDates", BlockDatesSchema);