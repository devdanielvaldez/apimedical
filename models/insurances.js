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
    }
  });
  
  module.exports = mongoose.model("Insurance", InsuranceSchema);