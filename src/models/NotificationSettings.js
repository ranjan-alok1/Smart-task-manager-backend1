import mongoose from 'mongoose';

const notificationSettingsSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: true
    },
    highPriority: {
        type: Boolean,
        default: true
    },
    mediumPriority: {
        type: Boolean,
        default: true
    },
    lowPriority: {
        type: Boolean,
        default: false
    },
    reminderTime: {
        type: Number,
        default: 60, // minutes before deadline
        min: 5,
        max: 180
    }
}, {
    timestamps: true
});

export default mongoose.model('NotificationSettings', notificationSettingsSchema);