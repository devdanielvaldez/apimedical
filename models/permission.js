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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;