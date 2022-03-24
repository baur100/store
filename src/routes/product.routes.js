import Router from 'express-promise-router';
const router = Router();
import auth from '../middleware/auth.js';
import productController from '../contollers/product.controller.js';
const {verifyToken} = auth;

router.post('/',verifyToken,productController.createProduct);
router.get('/search',verifyToken, productController.searchByProductName);
router.get('/',verifyToken,productController.getAllProducts);
router.get('/:id',verifyToken,productController.getProductById);
router.delete('/:id',verifyToken,productController.deleteProductById);
router.patch('/:id',verifyToken,productController.patchProductById);
router.put('/:id',verifyToken,productController.updateProductById);


export default router;