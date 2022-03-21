import Router from 'express-promise-router';
const router = Router();
import productController from '../contollers/product.controller.js';

router.post('/product',productController.createProduct);
router.get('/product/search', productController.searchByProductName);
router.get('/product',productController.getAllProducts);
router.get('/product/:id',productController.getProductById);
router.delete('/product/:id',productController.deleteProductById);
router.patch('/product/:id',productController.patchProductById);
router.put('/product/:id',productController.updateProductById);

export default router;