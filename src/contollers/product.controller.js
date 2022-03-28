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
        if (!Object.prototype.hasOwnProperty.call(obj,prop)) {
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
    if (Array.isArray(rows)){
        return rows.map((product)=>{
            return {
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                price: Number(Number(product.price).toFixed(2))
            };
        });
    }
    return {
        id: rows.id,
        name: rows.name,
        quantity: rows.quantity,
        price:Number(Number(rows.price).toFixed(2))
    };
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

/** Add new Product to database
 *
 * @param {object} req  - request
 * @param {object} req.headers - request headers
 * @param {object} req.body - request body
 * @param {string} req.body.product_name - product name
 * @param {string} req.body.quantity - product quantity
 * @param {number} req.body.price - product price
 * @param {object} req.user - token info
 * @param {number} req.user.role - user role
 * @param {number} req.user.sub - user id
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const createProduct = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const {body} = req;
    const { name, quantity, price } = body;

    if (name ===undefined || quantity ===undefined || price ===undefined){
        resp = {error: 'name, quantity, price are required'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }

    let rows;
    try {
        const dbResponse = await db.query(
            'INSERT INTO products (name, quantity, price) VALUES ($1, $2, $3) RETURNING id',
            [name, quantity, price]
        );
        rows = dbResponse.rows;
    } catch (err) {
        resp = {error: err.detail};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    resp = {
        id: rows[0].id,
        name,
        quantity,
        price,
    };
    const productResp = isXmlResponse ? convertProductToXml(resp) : resp;
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
    const id = parseInt(req.params.id);
    if (isNaN(id)){
        resp =  {error: 'Wrong id - should be a number'};
        error = isXmlResponse ? convertErrorToXml(resp) :resp;
        return res.status(400).send(error);
    }
    const { rows } = await db.query(
        'select * from products where id = $1',
        [id]
    );
    if(rows.length===0) {
        resp = {error: `Product with id ${id} not found`};
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
 * @param {object} req.user - token info
 * @param {number} req.user.role - user role
 * @param {number} req.user.sub - user id
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const deleteProductById = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const id = parseInt(req.params.id);
    if (isNaN(id)){
        resp = {error: 'Wrong id - should be a number'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    const {rowCount} = await db.query(
        'delete from products where id = $1',
        [id]
    );

    if (rowCount === 0){
        resp = {error: `Product with id ${id} not found`};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(404).send(error);
    }
    resp = {message: `Product with id ${id} has been deleted`};
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
 * @param {number} req.body.price - product price
 * @param {object} req.user - token info
 * @param {number} req.user.role - user role
 * @param {number} req.user.sub - user id
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const patchProductById = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const id = parseInt(req.params.id);
    let rowCount=0;
    let quantity;
    let price;
    let dbResponse;
    if (isNaN(id)){
        resp = {error: 'Wrong id - should be a number'};
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
            dbResponse  = await db.query(
                'UPDATE products SET quantity = $1 WHERE id = $2 RETURNING name;',
                [quantity, id]
            );
            rowCount = dbResponse.rowCount;
        } catch (err) {
            resp = {error: err.detail};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
    }

    if(reqPrice !== undefined) {
        price = Number(reqPrice).toFixed(2);
        if (isNaN(price)){
            resp = {error: 'Wrong price - should be number'};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
        try {
            dbResponse  = await db.query(
                'UPDATE products SET price = $1 WHERE id = $2 RETURNING name;',
                [price, id]
            );
            rowCount = dbResponse.rowCount;
        } catch (err) {
            resp = {error: err.detail};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
    }

    if (rowCount === 0){
        resp = {error: `Product with id ${id} not found`};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(404).send(error);
    }
    const respObj = {
        name: dbResponse.rows[0].name,
        id,
        quantity,
        price,
    };
    resp = convertOutput(respObj);
    const productResp = isXmlResponse ? convertProductToXml(resp) :resp;
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
 * @param {number} req.body.quantity - product quantity
 * @param {number} req.body.price - product price
 * @param {object} req.user - token info
 * @param {number} req.user.role - user role
 * @param {number} req.user.sub - user id
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const updateProductById = async (req, res) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const {body} = req;
    const { name, quantity, price } = body;
    const id = parseInt(req.params.id);
    if (isNaN(id)){
        resp = {error: 'Wrong id - should be a number'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    if (name ===undefined || quantity ===undefined || price ===undefined){
        resp = {error: 'name, quantity, price are required'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }
    let rowCount;
    try {
        const dbResponse  = await db.query(
            'UPDATE products SET name = $1, quantity = $2, price = $3 WHERE id = $4;',
            [name, quantity, price.toFixed(2),id]
        );
        rowCount = dbResponse.rowCount;
    } catch (err) {
        resp = {error: err.detail};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(400).send(error);
    }

    if (rowCount === 0){
        resp = {error: `Product with id ${id} not found`};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(404).send(error);
    }
    const respObj = {
        id,
        name,
        quantity: Number(quantity),
        price: Number(price).toFixed(2),
    };
    resp = convertOutput(respObj);
    const productResponse = isXmlResponse ? convertProductToXml(resp) :resp;
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
        'select * from products where lower(name) = $1',
        [name.toLowerCase()]
    );
    if(rows.length===0) {
        resp = {error: `Product with name =  ${name} not found`};
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