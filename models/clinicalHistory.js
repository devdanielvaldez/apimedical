const mongoose = require('mongoose');

const ClinicalHistorySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients',
        required: true,
    },
    medicalHistory: {
        personal: {
            diseases: [{ type: String }], // Enfermedades previas
            surgeries: [{ type: String }], // Cirugías o procedimientos quirúrgicos
            allergies: [{ type: String }], // Alergias
            medications: [{ type: String }], // Medicamentos actuales
            hospitalizations: [{ type: String }], // Hospitalizaciones previas
            vaccines: [{ type: String }], // Vacunas
        },
        family: {
            hereditaryDiseases: [{ type: String }], // Enfermedades hereditarias
            familyHistory: [{ type: String }], // Historia médica de padres, hermanos, abuelos
        },
    },
    lifestyle: {
        diet: { type: String }, // Alimentación
        physicalActivity: { type: String }, // Actividad física
        substanceUse: { type: String }, // Consumo de alcohol, tabaco o drogas
        sleep: { type: String }, // Sueño
        stressLevel: { type: String }, // Nivel de estrés
        socialRelationships: { type: String }, // Relaciones sociales y familiares
    },
    physicalExam: {
        vitalSigns: { type: String }, // Signos vitales
        general: { type: String }, // Examen general
        systems: { type: String }, // Sistemas
    },
    currentIllness: {
        description: { type: String }, // Descripción de la enfermedad actual
        onset: { type: String }, // Inicio
        duration: { type: String }, // Duración
        progression: { type: String }, // Progresión
        triggers: { type: String }, // Desencadenantes
        priorTreatments: { type: String }, // Tratamientos previos
    },
    labTests: [{ type: String }], // Pruebas de laboratorio
    diagnoses: [{ type: String }], // Diagnósticos
    treatmentPlan: {
        medications: [{ type: String }], // Medicamentos
        therapies: [{ type: String }], // Terapias
        recommendations: { type: String }, // Recomendaciones
        followUp: { type: String }, // Seguimiento
    },
    embedding: {
        type: [Number],
        required: true,
      }
}, { timestamps: true });

module.exports = mongoose.model('ClinicalHistory', ClinicalHistorySchema);