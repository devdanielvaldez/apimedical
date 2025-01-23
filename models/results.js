const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patients",
      required: true,
    },
    testName: {
      type: String,
      required: true,
    },
    testDate: {
      type: Date,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
    description: {
        type: String,
        required: false
    },
    pdfPassword: {
      type: String,
      required: true
    },
    embedding: { 
        type: [Number], 
        required: true 
      },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Result", ResultSchema);