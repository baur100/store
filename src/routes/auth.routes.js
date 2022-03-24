import Router from 'express-promise-router';
const router = Router();
import authController from '../contollers/auth.controller.js';

router.post('/register',authController.registerUser);
router.post('/login',authController.login);
router.get('/users',authController.getAllUsers);
router.get('/user/:id', authController.getUserById);
router.delete('/user/:id',authController.deleteUser);
router.patch('/user/:id',authController.updateUser);


export default router;