const mongoose = require("mongoose");

const UsersGeneralsSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model("UsersGenerals", UsersGeneralsSchema);