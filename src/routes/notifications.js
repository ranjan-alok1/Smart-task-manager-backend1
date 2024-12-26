import express from 'express';
import {
    getSettings,
    updateSettings,
    subscribeToNotifications,
    sendTestNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/subscribe', subscribeToNotifications);
router.post('/test', sendTestNotification);

export default router;