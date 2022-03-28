import bcrypt from 'bcryptjs';
import { KJUR } from 'jsrsasign';
import db from '../config/database.js';

const createToken = (opts, privateKey) => {
    const iss = process.env.SCHEME+'://'+process.env.HOST+'/api';
    const time = Math.round(Date.now() / 1000);
    const expTime = time + 60 * 60;
    const header = {
        alg: 'RS256',
        typ: 'JWT',
    };
    const tokenOpts = {
        ...opts,
        iss,
        iat: time,
        exp: expTime,
    };
    const sHeader = JSON.stringify(header);
    const sData = JSON.stringify(tokenOpts);

    return KJUR.jws.JWS.sign(header.alg, sHeader, sData, privateKey.replace(/\\n/gm, '\n'));
};

/**
 * Add new User to database
 *
 * @param {object} req  - request
 * @param {object} req.headers - request headers
 * @param {object} req.body - request body
 * @param {string} req.body.username - username
 * @param {string} req.body.password - user password
 * @param {string} req.body.email - user email
 * @param {number} [req.body.role] - user role = default 2
 * @param {object} res - response object
 * @returns {Promise<*>}
 */
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    let dbResponse;
    if (!(email && password && username)) {
        return res.status(400).send({error: 'Please provide username, password and email'});
    }

    dbResponse = await db.query(
        'select * from users where email = $1',
        [email]
    );
    if(dbResponse.rows.length!==0){
        return res.status(409).send({error:'User with that email is already exist. Please Login'});
    }
    dbResponse = await db.query(
        'select * from users where username = $1',
        [username]
    );
    if(dbResponse.rows.length!==0){
        return res.status(409).send({error:'Username is in use - please choose different'});
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    const userRole = role===undefined ? 2 :role;

    try {
        dbResponse = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, email.toLowerCase(), encryptedPassword, userRole]
        );
    } catch (err) {
        return res.status(400).send({error:err.detail});
    }
    const userId = dbResponse.rows[0].id;

    const tokenBody = {
        sub: userId,
        role:userRole
    };
    const token = createToken(tokenBody, process.env.PRIVATE_KEY);

    const resp = {
        userId,
        username,
        email: email.toLowerCase(),
        password: encryptedPassword,
        token,
        userRole,
    };
    return res.status(201).send(resp);
};

/**
 * Log user in
 *
 * @param req
 * @param {object} req.headers - request headers
 * @param {object} req.body - request body
 * @param {string} req.body.username - username
 * @param {string} req.body.password - password
 * @param res
 * @returns {Promise<*>}
 */
const login = async (req, res) => {
    let dbResponse;
    const {username, password} = req.body;
    if (!(username && password)) {
        return res.status(400).send({error:'All input is required'});
    }
    dbResponse = await db.query(
        'select * from users where username = $1',
        [username]
    );
    const user = dbResponse.rows[0];

    if(dbResponse.rows.length!==0 &&(await bcrypt.compare(password,user.password))){
        const tokenBody = {
            sub: user.id,
            role:user.role,
        };
        user.token = createToken(tokenBody, process.env.PRIVATE_KEY);
        return res.status(200).send(user);
    }
    return res.status(401).send({error:'Invalid Credentials'});
};

/**
 * Get all users
 *
 * @param req
 * @param {object} req.headers - request headers
 * @param {object} req.body - request body
 * @param {string} req.body.username - username
 * @param {string} req.body.password - password
 * @param res
 * @returns {Promise<*>}
 */
const getAllUsers = async (req, res) => {
    const { rows } = await db.query(
        'select * from users',
        []
    );
    /* eslint-disable no-unused-vars*/
    const users= rows.map(({password, ...rest}) => rest);
    return res.status(200).send(users);
};

/**
 *
 * @param req
 * @param {object} req.headers - request headers
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {object} req.body - request body
 * @param {string} req.body.username - username
 * @param {string} req.body.password - password
 * @param res
 * @returns {Promise<*>}
 */
const getUserById = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)){
        return res.status(400).send({error: 'Wrong id - should be a number'});
    }
    const { rows } = await db.query(
        'select * from users where id = $1',
        [userId]
    );
    if(rows.length===0) {
        return res.status(404).send({error: `User with id ${userId} not found`});
    }
    const user = rows[0];
    delete user.password;
    return res.status(200).send(user);
};

/**
 * Delete user by id
 *
 * @param req
 * @param {object} req.headers - request headers
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {object} req.body - request body
 * @param {string} req.body.username - username
 * @param {string} req.body.password - password
 * @param res
 * @returns {Promise<*>}
 */
const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)){
        return res.status(400).send({error: 'Wrong id - should be a number'});
    }
    const {rowCount} = await db.query(
        'delete from users where id = $1',
        [userId]
    );

    if (rowCount === 0){
        return res.status(404).send({error: `User with id ${userId} not found`});
    }
    return res.status(200).send({message: `User with id ${userId} has been deleted`});
};

/**
 * Update user role
 *
 * @param req
 * @param {object} req.headers - request headers
 * @param {object} req.params - request path params
 * @param {string} req.params.id - product id - should be number
 * @param {object} req.body - request body
 * @param {object} req.body.role - new role
 * @param res
 * @returns {Promise<*>}
 */
const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)){
        return res.status(400).send({error: 'Wrong id - should be a number'});
    }
    const role = req.body.role;
    if(role === undefined){
        return res.status(400).send({error: 'Role is required'});
    }
    if (isNaN(role)){
        return res.status(400).send({error: 'Role should be a number'});
    }
    const roles = ['1','2'];
    if(!roles.includes(role)){
        return res.status(400).send({error: 'Wrong role id'});
    }

    try {
        const dbResponse  = await db.query(
            'UPDATE users SET role = $1 WHERE id = $2;',
            [role, userId]
        );
        const rowCount = dbResponse.rowCount;
        if(rowCount===0){
            return res.status(404).send({error: `User with id ${userId} not found`});
        }
    } catch (err) {
        return res.status(400).send({error: err.detail});
    }
    return res.status(200).send({message: `Role ${role} set for user ${userId}`});

};

export default {createToken, registerUser, login,getAllUsers,getUserById,deleteUser,updateUser};