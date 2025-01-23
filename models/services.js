const mongoose = require("mongoose");

const ServicesSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true
  },
  servicePrice: {
    type: Number,
    required: true
  },
  serviceWithInsurance: {
    type: Number,
    required: false
  },
  embedding: {
    type: [Number],
    required: true,
  },
});

ServicesSchema.index({ serviceName: 1 }, { unique: true }); // Evita duplicados de días

module.exports = mongoose.model("Services", ServicesSchema);
