import db from '../config/database.js';

const convertOutput = (rows) => {
    return rows.map((product)=>{
        return {
            id: product.productid,
            product_name: product.productname,
            quantity: product.quantity,
            price: Number(product.price)
        }
    })
}

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
        return res.status(400).json({error: error.detail});
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
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const getProductById = async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        return res.status(400).json({error: 'Wrong id - should be number'});
    }
    const { rows } = await db.query(
        'select * from products where productId = $1',
        [productId]
    );
    if(rows.length===0) {
        return res.status(404).json({message: `Product with id ${productId} not found`});
    }

    const products = convertOutput(rows);
    return res.status(200).json(products[0]);
};

/**
 * Delete Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const deleteProductById = async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        return res.status(400).json({error: 'Wrong id - should be number'});
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
 * Patch quantity and/or price Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {string} req.body.quantity - product quantity
 * @param {string} req.body.price - product price
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const patchProductById = async (req, res) => {
    const productId = parseInt(req.params.id);
    let rowCount=0;
    let quantity;
    let price;
    if (isNaN(productId)){
        return res.status(400).json({error: 'Wrong id - should be number'});
    }
    const reqQuantity = req.body.quantity;
    const reqPrice = req.body.price;
    if(reqQuantity===undefined && reqPrice === undefined) {
        return res.status(400).json({error: 'Quantity or price should be provided'})
    }
    if(reqQuantity !== undefined) {
        quantity = parseInt(reqQuantity);
        if (isNaN(quantity)){
            return res.status(400).json({error: 'Wrong quantity - should be a number'});
        }
        try {
            const dbResponse  = await db.query(
                'UPDATE products SET quantity = $1 WHERE productid = $2;',
                [quantity, productId]
            );
            rowCount = dbResponse.rowCount;
        } catch (error) {
            return res.status(400).json({error: error.detail});
        }
    }

    if(reqPrice !== undefined) {
        price = Number(reqPrice);
        if (isNaN(price)){
            return res.status(400).json({error: 'Wrong price - should be a number'});
        }
        try {
            const dbResponse  = await db.query(
                'UPDATE products SET price = $1 WHERE productid = $2;',
                [price, productId]
            );
            rowCount = dbResponse.rowCount;
        } catch (error) {
            return res.status(400).json({error: error.detail});
        }
    }

    if (rowCount === 0){
        return res.status(404).json({error: `Product with id ${productId} not found`});
    }
    return res.status(200).json({
        message: `Product with id ${productId} has been updated`,
        product: {
            productId,
            quantity,
            price,
        },
    });
};

/**
 * Update Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {object} req.body - request body
 * @param {string} req.body.product_name - product name
 * @param {string} req.body.quantity - product quantity
 * @param {string} req.body.price - product price
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const updateProductById = async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        return res.status(400).json({error: 'Wrong id - should be number'});
    }
    const { product_name, quantity, price } = req.body;
    if (product_name ===undefined || quantity ===undefined || price ===undefined){
        return res.status(400).json({error: 'product_name, quantity, price are required'});
    }
    let rowCount;
    try {
        const dbResponse  = await db.query(
            'UPDATE products SET productname = $1, quantity = $2, price = $3 WHERE productid = $4;',
            [product_name, quantity, price,productId]
        );
        rowCount = dbResponse.rowCount;
    } catch (error) {
        return res.status(400).json({error: error.detail});
    }

    if (rowCount === 0){
        return res.status(404).json({error: `Product with id ${productId} not found`});
    }
    return res.status(200).json({
        message: `Product with id ${productId} has been updated`,
        product: {
            productId,
            ...req.body
        },
    });
};

/**
 * Get Product by product name
 *
 * @param {object} req  - request
 * @param {object} req.query - request query params
 * @param {string} req.query.name - product name
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const searchByProductName = async (req, res) => {
    const name = req.query.name.trim();

    const { rows } = await db.query(
        'select * from products where productname = $1',
        [name]
    );
    if(rows.length===0) {
        return res.status(404).json({message: `Product with name =  ${name} not found`});
    }
    const products = convertOutput(rows);

    return res.status(200).json(products);
};

/**
 * Get All Products
 *
 * @param {object} req  - request
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const getAllProducts = async (req, res) => {
    const { rows } = await db.query(
        'select * from products',
        []
    );

    const products = convertOutput(rows);
    return res.status(200).json(products);
};

export default {createProduct, getProductById, deleteProductById, patchProductById,updateProductById,searchByProductName,getAllProducts};