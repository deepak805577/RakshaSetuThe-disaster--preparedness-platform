import express from 'express';
import { register, login, getProfile, updateProfile, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logout);

export default router;
