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
  deletedAt: { // Fecha de eliminación
    type: Date,
    default: null,
  },
  branchOfficeId: { // Sucursal a la que pertenece
    type: mongoose.Schema.Types.ObjectId,
    ref: "BranchOffices",
    required: true,
  },
  userCreator: { // Usuario que crea el registro
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  userUpdated: { // Usuario que modifica el registro
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
  },
});

module.exports = mongoose.model("Accounting", AccountingSchema);