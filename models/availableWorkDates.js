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
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    //Establecer si el registro esta activo o no
  },
  idBranchOffice:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BranchOffice",
    required: true 
  }
});

AvailableWorkDaysSchema.index({ dayOfWeek: 1 }, { unique: true }); // Evita duplicados de días

module.exports = mongoose.model("AvailableWorkDays", AvailableWorkDaysSchema);
