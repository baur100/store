import Router from 'express-promise-router';
const router = Router();
import authController from '../contollers/auth.controller.js';

router.post('/register',authController.registerUser);
router.post('/login',authController.login);

export default router;