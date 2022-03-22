import Router from 'express-promise-router';
const router = Router();
import productController from '../contollers/product.controller.js';

router.post('/',productController.createProduct);
router.get('/search', productController.searchByProductName);
router.get('/',productController.getAllProducts);
router.get('/:id',productController.getProductById);
router.delete('/:id',productController.deleteProductById);
router.patch('/:id',productController.patchProductById);
router.put('/:id',productController.updateProductById);

export default router;