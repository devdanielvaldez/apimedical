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
  isActive:{
    type: Boolean,
    required: true,
    default: true
    //Establecer si el registro esta activo o no
  },
  availableWorkDaysId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "AvailableWorkDays",
      required: false 
    }
});

module.exports = mongoose.model('BranchOffice', BranchOfficeSchema);