import express from 'express';
import {
    getTaskInsights,
    getSchedulingSuggestions,
    getProductivityAnalysis
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/insights', getTaskInsights);
router.post('/schedule', getSchedulingSuggestions);
router.post('/analyze', getProductivityAnalysis);

export default router;