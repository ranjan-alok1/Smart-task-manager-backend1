import NotificationSettings from '../models/NotificationSettings.js';
import { io } from '../server.js';
import { scheduleTaskReminders } from '../services/notificationService.js';

export const getSettings = async (req, res, next) => {
    try {
        let settings = await NotificationSettings.findOne();
        if (!settings) {
            settings = await NotificationSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req, res, next) => {
    try {
        const settings = await NotificationSettings.findOneAndUpdate(
            {},
            req.body,
            { new: true, upsert: true, runValidators: true }
        );

        // Reschedule reminders with new settings
        await scheduleTaskReminders();

        res.json(settings);
    } catch (error) {
        next(error);
    }
};

export const subscribeToNotifications = async (req, res, next) => {
    try {
        const { subscription } = req.body;
        // Store subscription details if needed
        res.json({ message: 'Subscription successful' });
    } catch (error) {
        next(error);
    }
};

export const sendTestNotification = async (req, res, next) => {
    try {
        io.emit('notification', {
            type: 'test',
            message: 'This is a test notification'
        });
        res.json({ message: 'Test notification sent' });
    } catch (error) {
        next(error);
    }
};