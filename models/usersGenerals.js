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
    }, 
    deletedAt: { // Fecha de eliminación
      type: Date,
      default: null
    },
    branchOfficeId: { // Validar si es requerido este campo de la Sucursal
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

module.exports = mongoose.model("UsersGenerals", UsersGeneralsSchema);
