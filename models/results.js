const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patients",
      required: true,
    },
    testName: {
      type: String,
      required: true,
    },
    testDate: {
      type: Date,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
    description: {
        type: String,
        required: false
    },
    pdfPassword: {
      type: String,
      required: true
    },
    embedding: { 
        type: [Number], 
        required: true 
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Result", ResultSchema);