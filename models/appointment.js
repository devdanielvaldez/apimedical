const mongoose = require("mongoose");

const AppointmentsSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patients", // Referencia al modelo de pacientes
    required: true 
  },
  patientMotive: { 
    type: String, 
    required: true 
  },
  patientIsInsurante: { 
    type: Boolean, 
    required: false 
  },
  dateAppointment: { 
    type: Date, 
    required: true 
  },
  dateTimeAppointment: { 
    type: String, 
    required: true,
    validate: {
      validator: function (v) {
        return /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i.test(v);
      },
      message: (props) => `${props.value} no es un formato de hora válido (hh:mm AM/PM)`,
    },    
  },
  statusAppointment: { 
    type: String, 
    enum: ['CO', 'PE', 'CA', 'IN', 'COF'], 
    required: true, 
    default: 'CO' 
  },
  embedding: { 
    type: [Number], 
    required: true 
  },
  services: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Services",
    required: true
  }],
  isWithInsurance: {
    type: Boolean,
    required: false
  }, 
  deletedAt: { // Fecha de eliminación
    type: Date,
    default: null,
  },
  branchOfficeId: { // Sucursal a la que pertenece
    type: mongoose.Schema.Types.ObjectId,
    ref: "BranchOffices",
    required: false,
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

module.exports = mongoose.model("Appointments", AppointmentsSchema);
