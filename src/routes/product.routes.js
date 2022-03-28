import Router from 'express-promise-router';
const router = Router();
import auth from '../middleware/auth.js';
import productController from '../contollers/product.controller.js';
const {verifyToken,veryAdmin} = auth;

router.post('/',veryAdmin,productController.createProduct);
router.get('/search',verifyToken, productController.searchByProductName);
router.get('/',verifyToken,productController.getAllProducts);
router.get('/:id',verifyToken,productController.getProductById);
router.delete('/:id',veryAdmin,productController.deleteProductById);
router.patch('/:id',veryAdmin,productController.patchProductById);
router.put('/:id',veryAdmin,productController.updateProductById);


export default router;