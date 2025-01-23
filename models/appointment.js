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
  }
});

module.exports = mongoose.model("Appointments", AppointmentsSchema);