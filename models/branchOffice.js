const mongoose = require('mongoose');

const BranchOfficeSchema = new mongoose.Schema({
  nameBranchOffice: {
    type: String,
    required: true, 
    //Nombre del centro hospitalario/sucursal/consultorio
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
    //Número de teléfono del centro hospitalario/sucursal/consultorio
  },
  phoneExtension: {
    type: String,
    required: false
  },
  whatsApp: {
    type: String,
    required: false
    //Numero WhatsApp del consultorio
  },
  email: {
    type: String,
    required: true
  }, 
    deletedAt: { // Fecha de eliminación
      type: Date,
      default: null
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
    },
  availableWorkDaysId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "AvailableWorkDays",
      required: false 
    }
});

module.exports = mongoose.model('BranchOffice', BranchOfficeSchema);