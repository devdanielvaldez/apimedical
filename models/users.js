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
 
    deletedAt: { // Fecha de eliminación
      type: Date,
      default: null
    },
    branchOfficeId: { // Sucursal a la que pertenece
      type: mongoose.Schema.Types.ObjectId,
      ref: "BranchOffices",
      required: false,
    },
    userCreator: { // Usuario que crea el registro
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false,
    },
    userUpdates: { // Usuario que modifica el registro
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
    }
});

module.exports = mongoose.model("Users", UsersSchema);
