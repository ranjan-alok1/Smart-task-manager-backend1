import express from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
} from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);

export default router;