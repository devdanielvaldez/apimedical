const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }], 
    deletedAt: { // Fecha de eliminación
      type: Date,
      default: null
    },
    userCreator: { // Usuario que crea el registro
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
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

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;