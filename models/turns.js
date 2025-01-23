const mongoose = require("mongoose");

const TemporaryQueueSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointments",
    required: true,
  },
  arrivalTime: {
    type: Date,
    default: Date.now,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  isInProgress: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("TemporaryQueue", TemporaryQueueSchema);