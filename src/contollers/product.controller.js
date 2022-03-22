import parser from 'xml2js';
import db from '../config/database.js';

let error;
let resp;
let message;

const convertArrayToXml = (products) => {
    const xml = objectArrayToXml(products);
    const frame = {products: 'stuff'};
    const builder =new  parser.Builder();
    const finalObj = builder.buildObject(frame);
    return finalObj.replace('stuff',xml);
};

const objectArrayToXml = (obj) => {
    let xml = '';
    for (let prop in obj) {
        if (!obj.hasOwnProperty(prop)) {
            continue;
        }
        if (obj[prop] === undefined)
            continue;
        let tag;
        if(!isNaN(prop)){
            tag = 'product';
        } else {
            tag= prop;
        }
        xml += '<' + tag + '>';

        if (typeof obj[prop] == 'object') {
            if (obj[prop].constructor === Array) {
                for (var i = 0; i < obj[prop].length; i++) {
                    xml += '<item>';
                    xml += objectArrayToXml(new Object(obj[prop][i]));
                    xml += '</item>';
                }
            } else {
                xml += objectArrayToXml(new Object(obj[prop]));
            }
        } else {
            xml += obj[prop];
        }
        if(!isNaN(prop)){
            tag = 'product';
        } else {
            tag= prop;
        }
        xml += '</' + tag + '>';
    }
    return xml;
};
const convertOutput = (rows) => {
    return rows.map((product)=>{
        return {
            id: product.productid,
            product_name: product.productname,
            quantity: product.quantity,
            price: Number(product.price).toFixed(2)
        };
    });
};

const convertProductToXml = (product) =>{
    const obj = {product};
    const builder = new parser.Builder();
    return builder.buildObject(obj);
};
const convertMessageToXml = (message) =>{
    const obj = {message};
    const builder = new parser.Builder();
    return builder.buildObject(obj);
};
const convertErrorToXml = (error) =>{
    const obj = {error};
    const builder = new parser.Builder();
    return builder.buildObject(obj);
};
const convertFullProductToXml = (response) =>{
    const obj = {response};
    const builder = new parser.Builder();
    return builder.buildObject(obj);
};

/** Add new Product to database
 *
 * @param {object} req  - request
 * @param {object} req.headers - request headers
 * @param {object} req.body - request body
 * @param {string} req.body.product_name - product name
 * @param {string} req.body.quantity - product quantity
 * @param {string} req.body.price - product price
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const createProduct = async (req, res) => {
    const {body} = req;
    const { product_name, quantity, price } = body;
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    if (product_name ===undefined || quantity ===undefined || price ===undefined){
        resp = {error: 'product_name, quantity, price are required'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }

    let rows;
    try {
        const dbResponse = await db.query(
            'INSERT INTO products (productname, quantity, price) VALUES ($1, $2, $3) RETURNING productId',
            [product_name, quantity, price]
        );
        rows = dbResponse.rows;
    } catch (err) {
        resp = {error: err.detail};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    resp = {
        message: 'Product added successfully!',
        product: {
            productId: rows[0].productid,
            product_name,
            quantity,
            price:price.toFixed(2),
        },
    };
    const productResp = isXmlResponse ? convertFullProductToXml(resp) : resp;

    return res.status(201).send(productResp);
};

/**
 * Get Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.headers - request headers
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const getProductById = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        resp =  {error: 'Wrong id - should be a number'};
        error = isXmlResponse ? convertErrorToXml(resp) :resp;
        return res.status(400).send(error);
    }
    const { rows } = await db.query(
        'select * from products where productId = $1',
        [productId]
    );
    if(rows.length===0) {
        resp = {message: `Product with id ${productId} not found`};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(404).send(error);
    }

    resp = convertOutput(rows)[0];
    const productResp = isXmlResponse ? convertProductToXml(resp) : resp;
    return res.status(200).send(productResp);
};

/**
 * Delete Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.headers - request headers
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const deleteProductById = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        resp = {error: 'Wrong id - should be number'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    const {rowCount} = await db.query(
        'delete from products where productid = $1',
        [productId]
    );

    if (rowCount === 0){
        resp = {error: `Product with id ${productId} not found`};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    resp = {message: `Product with id ${productId} has been deleted`};
    message = isXmlResponse ? convertMessageToXml(resp) : resp;
    return res.status(200).send(message);
};

/**
 * Patch quantity and/or price Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.headers - request headers
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {string} req.body.quantity - product quantity
 * @param {string} req.body.price - product price
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const patchProductById = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const productId = parseInt(req.params.id);
    let rowCount=0;
    let quantity;
    let price;
    if (isNaN(productId)){
        resp = {error: 'Wrong id - should be number'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    const reqQuantity = req.body.quantity;
    const reqPrice = req.body.price;
    if(reqQuantity===undefined && reqPrice === undefined) {
        resp = {error: 'Quantity or price should be provided'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    if(reqQuantity !== undefined) {
        quantity = parseInt(reqQuantity);
        if (isNaN(quantity)){
            resp = {error: 'Wrong quantity - should be number'};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
        try {
            const dbResponse  = await db.query(
                'UPDATE products SET quantity = $1 WHERE productid = $2;',
                [quantity, productId]
            );
            rowCount = dbResponse.rowCount;
        } catch (err) {
            resp = {error: err.detail};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
    }

    if(reqPrice !== undefined) {
        price = Number(reqPrice);
        if (isNaN(price)){
            resp = {error: 'Wrong price - should be number'};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
        try {
            const dbResponse  = await db.query(
                'UPDATE products SET price = $1 WHERE productid = $2;',
                [price, productId]
            );
            rowCount = dbResponse.rowCount;
        } catch (err) {
            resp = {error: err.detail};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
    }

    if (rowCount === 0){
        resp = {error: `Product with id ${productId} not found`};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(404).send(error);
    }
    resp = {
        message: `Product with id ${productId} has been updated`,
        product: {
            productId,
            quantity,
            price: price.toFixed(2),
        },
    };
    const productResp = isXmlResponse ? convertFullProductToXml(resp) :resp;
    return res.status(200).send(productResp);
};

/**
 * Update Product by product id
 *
 * @param {object} req  - request
 * @param {object} req.headers - request headers
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
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const {body} = req;
    const { product_name, quantity, price } = body;
    const productId = parseInt(req.params.id);
    if (isNaN(productId)){
        resp = {error: 'Wrong id - should be number'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    if (product_name ===undefined || quantity ===undefined || price ===undefined){
        resp = {error: 'product_name, quantity, price are required'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    let rowCount;
    try {
        const dbResponse  = await db.query(
            'UPDATE products SET productname = $1, quantity = $2, price = $3 WHERE productid = $4;',
            [product_name, quantity, price.toFixed(2),productId]
        );
        rowCount = dbResponse.rowCount;
    } catch (err) {
        resp = {error: err.detail};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }

    if (rowCount === 0){
        resp = {error: `Product with id ${productId} not found`};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(404).send(error);
    }
    resp = {
        message: `Product with id ${productId} has been updated`,
        product: {
            productId,
            product_name,
            quantity: Number(quantity),
            price: Number(price).toFixed(2),
        },
    };
    const productResponse = isXmlResponse ? convertFullProductToXml(resp) :resp;
    return res.status(200).send(productResponse);
};

/**
 * Get Product by product name
 *
 * @param {object} req  - request
 * @param {object} req.headers - request headers
 * @param {object} req.query - request query params
 * @param {string} req.query.name - product name
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const searchByProductName = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const name = req.query.name.trim();

    const { rows } = await db.query(
        'select * from products where productname = $1',
        [name]
    );
    if(rows.length===0) {
        resp = {error: `Product with name =  ${name}} not found`};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(404).send(error);
    }
    resp = convertOutput(rows);
    const productResp = isXmlResponse ? convertArrayToXml(resp) : resp;
    return res.status(200).send(productResp);
};

/**
 * Get All Products
 *
 * @param {object} req  - request
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const getAllProducts = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const { rows } = await db.query(
        'select * from products',
        []
    );

    resp =convertOutput(rows);
    const productResp = isXmlResponse ? convertArrayToXml(resp) : resp;
    return res.status(200).send(productResp);
};

export default {createProduct, getProductById, deleteProductById, patchProductById,updateProductById,searchByProductName,getAllProducts};