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
    required: true 
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
    type: String, 
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
});

module.exports = mongoose.model("Patients", PatientSchema);