// import pg from 'pg';
// import dotenv  from 'dotenv';
//
// const { Client } = pg;
// dotenv.config();
// const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });
//
// client.connect();
//
// export default {
//     query: (text, params) => client.query(text, params)
// };
//
import pg from 'pg';
import dotenv  from 'dotenv';


const {Pool} = pg;

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
    console.log('Connected to database');
});


export default {
    query: (text, params) => pool.query(text, params)
};