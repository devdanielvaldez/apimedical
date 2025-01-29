const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    screen: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    actions: {
        type: [String],
        required: true,
        enum: ['create', 'view', 'edit', 'delete']
    },

    deletedAt: { // Fecha de eliminación
      type: Date,
      default: null
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

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;