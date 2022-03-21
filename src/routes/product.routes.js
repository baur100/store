import Router from 'express-promise-router';
const router = Router();
import productController from '../contollers/product.controller.js';

router.post('/products',productController.createProduct);
router.get('/products/:id',productController.getProductById);

export default router;