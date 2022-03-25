import Router from 'express-promise-router';
const router = Router();
import authController from '../contollers/auth.controller.js';

router.post('/register',authController.registerUser);
router.post('/login',authController.login);
router.get('/',authController.getAllUsers);
router.get('/:id', authController.getUserById);
router.delete('/:id',authController.deleteUser);
router.patch('/:id',authController.updateUser);


export default router;