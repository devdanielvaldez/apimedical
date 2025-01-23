const mongoose = require('mongoose');

const AppointmentDetailsSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointments',
    required: true,
  },
  physicalExamination: {
    vitalSigns: {
      bloodPressure: { type: String }, // Presión arterial
      heartRate: { type: Number }, // Frecuencia cardíaca
      respiratoryRate: { type: Number }, // Frecuencia respiratoria
      temperature: { type: Number }, // Temperatura
      oxygenSaturation: { type: Number }, // Saturación de oxígeno
      weight: { type: Number }, // Peso
      height: { type: Number }, // Talla
      bmi: { type: Number }, // Índice de masa corporal
    },
    generalObservation: { type: String }, // Exploración general
    detailedExamination: {
      cardiovascular: { type: String }, // CardioVascular
      respiratory: { type: String }, // Repiración
      nervous: { type: String }, // Nervios
      digestive: { type: String }, // Digestivo
      musculoskeletal: { type: String }, // Musculoesquelético
      otherSystems: { type: String }, // Otros Sistemas
    },
  },
  currentIllnessHistory: {
    description: { type: String }, // Descripción detallada
    onset: { type: String }, // Inicio
    duration: { type: String }, // Duración
    progression: { type: String }, // Evolución
    triggers: { type: String }, // Factores desencadenantes
    previousTreatments: { type: String }, // Tratamientos previos
  },
  labTestsAndDiagnostics: {
    tests: [{ type: String }], // Exámenes realizados
    results: [{ type: String }], // Resultados
  },
  diagnoses: {
    presumptive: [{ type: String }], // Diagnósticos presuntivos
    definitive: [{ type: String }], // Diagnósticos definitivos
  },
  treatmentPlan: {
    medications: [{
      name: { type: String },
      dose: { type: String },
      frequency: { type: String },
    }], // Medicamentos prescritos
    therapies: [{ type: String }], // Terapias complementarias
    recommendations: { type: String }, // Recomendaciones generales
    followUp: { type: Date }, // Fecha de próxima cita
  },
  progress: {
    currentStatus: { type: String }, // Estado actual del paciente
    milestones: [{ 
      date: { type: Date }, // Fecha del hito
      description: { type: String } // Descripción del hito
    }], // Hitos alcanzados
    notes: { type: String }, // Notas adicionales sobre el progreso
  },
}, { timestamps: true });

module.exports = mongoose.model('AppointmentDetails', AppointmentDetailsSchema);