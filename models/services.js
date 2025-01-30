const mongoose = require("mongoose");

const ServicesSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true
  },
  servicePrice: {
    type: Number,
    required: true
  },
  serviceWithInsurance: {
    type: Number,
    required: false
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
    required: false,
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

ServicesSchema.index({ serviceName: 1 }, { unique: true }); // Evita duplicados de días

module.exports = mongoose.model("Services", ServicesSchema);
