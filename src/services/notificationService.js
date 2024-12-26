import Task from '../models/Task.js';
import NotificationSettings from '../models/NotificationSettings.js';
import { io } from '../server.js';

export const scheduleTaskReminders = async () => {
    const settings = await NotificationSettings.findOne();
    if (!settings?.enabled) return;

    const tasks = await Task.find({
        status: { $ne: 'completed' },
        dueDate: { $gt: new Date() }
    });

    tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const reminderTime = new Date(dueDate.getTime() - settings.reminderTime * 60000);

        if (reminderTime > new Date()) {
            setTimeout(() => {
                if (shouldSendReminder(task, settings)) {
                    io.emit('taskReminder', {
                        taskId: task._id,
                        title: task.title,
                        dueDate: task.dueDate,
                        priority: task.priority
                    });
                }
            }, reminderTime.getTime() - Date.now());
        }
    });
};

const shouldSendReminder = (task, settings) => {
    switch (task.priority) {
        case 'high':
            return settings.highPriority;
        case 'medium':
            return settings.mediumPriority;
        case 'low':
            return settings.lowPriority;
        default:
            return false;
    }
};

export const sendNotification = async (userId, notification) => {
    try {
        io.emit('notification', {
            userId,
            ...notification,
            timestamp: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
};

export const getNotificationSettings = async () => {
    try {
        let settings = await NotificationSettings.findOne();
        if (!settings) {
            settings = await NotificationSettings.create({});
        }
        return settings;
    } catch (error) {
        console.error('Error getting notification settings:', error);
        throw error;
    }
};

export const updateNotificationSettings = async (settingsData) => {
    try {
        const settings = await NotificationSettings.findOneAndUpdate(
            {},
            settingsData,
            { new: true, upsert: true }
        );
        return settings;
    } catch (error) {
        console.error('Error updating notification settings:', error);
        throw error;
    }
};

// Initialize reminders when the service starts
scheduleTaskReminders().catch(console.error);