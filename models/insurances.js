const mongoose = require("mongoose");

const InsuranceSchema = new mongoose.Schema({
    insuranceName: {
      type: String,
      required: true,
      unique: true, // Para evitar duplicados de nombres de seguros
    },
    isActive: {
      type: Boolean,
      default: true
    },
    contactPhone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Valida números de 10 dígitos
        },
        message: props => `${props.value} no es un número de teléfono válido.`,
      },
    },
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Services", // Relación con el esquema de servicios
          required: true,
        },
        insurancePrice: {
          type: Number,
          required: true, // Precio que paga la aseguradora por este servicio
        },
      },
    ],
    embedding: {
      type: [Number],
      required: true,
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
      }
  });
  
  module.exports = mongoose.model("Insurance", InsuranceSchema);