const mongoose = require("mongoose");

const AvailableWorkDaysSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    required: true,
    enum: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ],
  },
  workHours: [
    {
      startTime: {
        type: String, // Formato HH:mm
        required: true,
        validate: {
          validator: function (v) {
            return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
          },
          message: (props) => `${props.value} no es un formato de hora válido (HH:mm)`,
        },
      },
      endTime: {
        type: String, // Formato HH:mm
        required: true,
        validate: {
          validator: function (v) {
            return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
          },
          message: (props) => `${props.value} no es un formato de hora válido (HH:mm)`,
        },
      },
    },
  ],
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

AvailableWorkDaysSchema.index({ dayOfWeek: 1 }, { unique: true }); // Evita duplicados de días

module.exports = mongoose.model("AvailableWorkDays", AvailableWorkDaysSchema);
