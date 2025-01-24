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
    }
});

module.exports = mongoose.model("Users", UsersSchema);