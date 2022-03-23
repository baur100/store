import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!(email && password && username)) {
        res.status(400).send({error: 'Please provide username, password and email'});
    }
    let { rows } = await db.query(
        'select * from users where email = $1',
        [email]
    );
    if(rows.length!==0){
        return res.status(409).send({error:'User Already Exist. Please Login'});
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    const userRole = role===undefined ? 2 :role;

    try {
        const dbResponse = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, email.toLowerCase(), encryptedPassword, userRole]
        );
        rows = dbResponse.rows[0];
    } catch (err) {
        return res.status(400).send({error:err.detail});
    }
    const userId = rows.id;
    const iss = process.env.SCHEME+'://'+process.env.HOST+'/api';
    const token = jwt.sign({sub: userId, iss}, process.env.PRIVATE_KEY,{expiresIn: '2h'});

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

const login = async (req, res) => {
    return res.status(300).send('ok');
};

export default {registerUser, login};