const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: false 
  },
  whatsAppNumber: { 
    type: String, 
    required: false 
  },
  address: { 
    type: String, 
    required: false 
  },
  identification: { 
    type: String, 
    required: false 
  },
  isInsurance: {
    type: Boolean,
    required: false
  },
  insuranceMake: { 
    type: mongoose.Types.ObjectId,
    ref: 'Insurance', 
    required: false 
  },
  insuranceImage: { 
    type: String, 
    required: false 
  },
  bornDate: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    enum: ['M', 'F'],
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

module.exports = mongoose.model("Patients", PatientSchema);
