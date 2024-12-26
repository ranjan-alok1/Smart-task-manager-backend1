class NotificationService {
    constructor(io) {
        this.io = io;
        this.checkInterval = 60000; // Check every minute
        this.startNotificationCheck();
    }

    startNotificationCheck() {
        setInterval(() => {
            this.checkTaskNotifications();
        }, this.checkInterval);
    }

    async checkTaskNotifications() {
        try {
            const Task = require('../models/Task');
            const now = new Date();

            // Check for tasks based on priority timing
            const priorities = ['high', 'medium', 'low'];
            for (const priority of priorities) {
                // Calculate the time window for each priority
                const timeWindow = {
                    high: 60, // 60 minutes for high priority
                    medium: 120, // 120 minutes for medium priority
                    low: 180 // 180 minutes for low priority
                };

                const minutesAhead = timeWindow[priority];
                const futureTime = new Date(now.getTime() + minutesAhead * 60000);

                const tasks = await Task.find({
                    priority: priority,
                    status: 'pending',
                    dueDate: {
                        $gt: now,
                        $lte: futureTime
                    }
                }).sort({ dueDate: 1 });

                tasks.forEach(task => {
                    const minutesUntilDue = Math.round((task.dueDate - now) / 60000);
                    
                    // Only send notification if within the notification window
                    if (minutesUntilDue <= timeWindow[priority]) {
                        this.sendNotification({
                            type: 'task_due_soon',
                            title: 'Task Due Soon',
                            message: `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority task "${task.title}" is due in ${minutesUntilDue} minutes!`,
                            task: {
                                _id: task._id,
                                title: task.title,
                                description: task.description,
                                priority: task.priority,
                                dueDate: task.dueDate,
                                status: task.status
                            },
                            priority: priority,
                            minutesUntilDue: minutesUntilDue
                        });
                    }
                });
            }

            // Check for overdue tasks at the end of the day (5 PM)
            const currentHour = now.getHours();
            if (currentHour === 17) {
                const overdueTasks = await Task.find({
                    status: 'pending',
                    dueDate: { $lt: now }
                }).sort({ dueDate: 1 });

                if (overdueTasks.length > 0) {
                    const tasksList = overdueTasks.map(task => ({
                        _id: task._id,
                        title: task.title,
                        priority: task.priority,
                        dueDate: task.dueDate
                    }));

                    this.sendNotification({
                        type: 'overdue_tasks',
                        title: 'Overdue Tasks Reminder',
                        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}!`,
                        tasks: tasksList
                    });
                }
            }
        } catch (error) {
            // Error handling is done silently to prevent notification service disruption
        }
    }

    sendNotification(notification) {
        this.io.emit('notification', notification);
    }
}

module.exports = NotificationService; 