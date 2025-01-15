const mongoose = require("mongoose");

const AppointmentsSchema = new mongoose.Schema({
  patientName: { 
    type: String, 
    required: true 
  },
  patientPhoneNumber: { 
    type: String, 
    required: true 
  },
  patientWhatsAppNumber: { 
    type: String, 
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
  insuranceMake: { 
    type: String, 
    required: false 
  },
  identification: { 
    type: String, 
    required: false 
  },
  insuranceImage: { 
    type: String, 
    required: false 
  },
  address: { 
    type: String, 
    required: false 
  },
  dateAppointment: { 
    type: Date, // Almacenamos solo la fecha
    required: true 
  },
  dateTimeAppointment: { 
    type: String, // Hora seleccionada en formato HH:mm
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
    enum: ['CO', 'PE', 'CA'], 
    required: true, 
    default: 'CO' 
  },
  embedding: { 
    type: [Number], 
    required: true 
  },
});

module.exports = mongoose.model("Appointments", AppointmentsSchema);