const mongoose = require("mongoose");

const AccountingSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointments",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  servicesUsed: [
    {
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: true,
      },
      servicePrice: {
        type: Number,
        required: false,
      },
      insurancePrice: {
        type: Number,
        required: false, // Precio que cubre el seguro
      },
      userPay: {
        type: Number,
        required: false, // Monto que paga el paciente
      },
    },
  ],
  totalEarned: {
    type: Number,
    required: true,
  },
  paymentWithoutInsurance: {
    type: Number,
    required: false,
  },
  insuranceCoverage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Insurance",
    required: false,
  },
  amountPaidByInsurance: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model("Accounting", AccountingSchema);