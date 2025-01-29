const mongoose = require("mongoose");

const TemporaryQueueSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointments",
    required: true,
  },
  arrivalTime: {
    type: Date,
    default: Date.now,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  isInProgress: {
    type: Boolean,
    default: false
  }, 
  deletedAt: { // Fecha de eliminación
    type: Date,
    default: null
  },
  branchOfficeId: { // Sucursal a la que pertenece
    type: mongoose.Schema.Types.ObjectId,
    ref: "BranchOffices",
    required: false,
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

module.exports = mongoose.model("TemporaryQueue", TemporaryQueueSchema);