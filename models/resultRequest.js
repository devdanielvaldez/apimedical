const mongoose = require("mongoose");
const { Schema } = mongoose;

const ResultRequestSchema = new Schema({
  resultName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["S", "C"], // S = Solicitado, C = Cargado
    default: "S",
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  uploadDate: {
    type: Date,
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
});

ResultRequestSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "C") {
    this.uploadDate = new Date();
  }
  next();
});

const ResultRequest = mongoose.model("ResultRequest", ResultRequestSchema);

module.exports = ResultRequest;
