import db from '../config/database.js';

/** Add new Product to database
 *
 * @param {object} req  - request
 * @param {object} req.body - request body
 * @param {string} req.body.product_name - product name
 * @param {string} req.body.quantity - product quantity
 * @param {string} req.body.price - product price
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const createProduct = async (req, res) => {
    const { product_name, quantity, price } = req.body;
    if (product_name ===undefined || quantity ===undefined || price ===undefined){
        return res.status(400).json({error: 'product_name, quantity, price are required'});
    }
    let rows;
    try {
        const dbResponse = await db.query(
            'INSERT INTO products (productname, quantity, price) VALUES ($1, $2, $3) RETURNING productId',
            [product_name, quantity, price]
        );
        rows = dbResponse.rows;
    } catch (error) {
        return res.status(400).json({error: error.detail})
    }

    return res.status(201).json({
        message: 'Product added successfully!',
        product: {
            productId: rows[0].productid,
            ...req.body
        },
    });
};

/**
 * Get Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.param - request path params
 * @param {string} req.param.id - product id - should be number
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const getProductById = async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        return res.status(400).json({error: 'Wrong id - should be number'})
    }
    const { rows } = await db.query(
        'select * from products where productId = $1',
        [productId]
    );
    if(rows.length===0) {
        return res.status(404).json({message: `Product with id ${productId} not found`});
    }

    return res.status(200).json(rows[0]);
};

/**
 * Delete Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.param - request path params
 * @param {string} req.param.id - product id - should be number
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const deleteProductById = async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        return res.status(400).json({error: 'Wrong id - should be number'})
    }
    const {rowCount} = await db.query(
        'delete from products where productid = $1',
        [productId]
    );

    if (rowCount === 0){
        return res.status(404).json({error: `Product with id ${productId} not found`});
    }
    return res.status(200).json({message: `Product with id ${productId} has been deleted`});
};

/**
 * Delete Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.param - request path params
 * @param {string} req.param.id - product id - should be number
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const patchProductById = async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        return res.status(400).json({error: 'Wrong id - should be number'})
    }
    const {rowCount} = await db.query(
        'delete from products where productid = $1',
        [productId]
    );

    if (rowCount === 0){
        return res.status(404).json({error: `Product with id ${productId} not found`});
    }
    return res.status(200).json({message: `Product with id ${productId} has been deleted`});
};

/**
 * Delete Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.param - request path params
 * @param {string} req.param.id - product id - should be number
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const updateProductById = async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        return res.status(400).json({error: 'Wrong id - should be number'})
    }
    const {rowCount} = await db.query(
        'delete from products where productid = $1',
        [productId]
    );

    if (rowCount === 0){
        return res.status(404).json({error: `Product with id ${productId} not found`});
    }
    return res.status(200).json({message: `Product with id ${productId} has been deleted`});
};

export default {createProduct, getProductById, deleteProductById, patchProductById,updateProductById};