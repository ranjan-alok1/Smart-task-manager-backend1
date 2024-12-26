import Task from '../models/Task.js';
import { io } from '../server.js';

export const getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find().sort({ dueDate: 1 });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

export const getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req, res, next) => {
    try {
        const task = new Task(req.body);
        await task.save();

        // Notify connected clients about new task
        io.emit('taskCreated', task);

        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Notify connected clients about task update
        io.emit('taskUpdated', task);

        res.json(task);
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Notify connected clients about task deletion
        io.emit('taskDeleted', req.params.id);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Notify connected clients about status update
        io.emit('taskStatusUpdated', task);

        res.json(task);
    } catch (error) {
        next(error);
    }
};