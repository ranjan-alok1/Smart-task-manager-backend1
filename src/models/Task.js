const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    description: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
        validate: {
            validator: function(value) {
                return value instanceof Date && !isNaN(value);
            },
            message: 'Invalid due date'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add index for querying tasks by due date and status
taskSchema.index({ dueDate: 1, status: 1, priority: 1 });

module.exports = mongoose.model('Task', taskSchema);