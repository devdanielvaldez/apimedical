const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    pwd: {
        type: String,
        required: true
    },
    userGeneral: {
        type: mongoose.Types.ObjectId,
        ref: 'UsersGenerals',
        required: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = mongoose.model("Users", UsersSchema);