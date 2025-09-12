
import express from 'express';
const router = express.Router();

// Test endpoint to verify backend is working
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running successfully!',
    timestamp: new Date().toISOString()
  });
});

export default router;
