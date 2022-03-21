import pg from 'pg';
import dotenv  from 'dotenv';

const { Client } = pg;
dotenv.config();
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

export default {
    query: (text, params) => client.query(text, params)
};

// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     client.end();
// });
// import pg from 'pg';
// import dotenv  from 'dotenv';
//
//
// const {Pool} = pg;
//
// dotenv.config();
//
// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL
// });
//
// pool.on('connect', () => {
//     console.log('Connected to database');
// });
//
//
// export default {
//     query: (text, params) => pool.query(text, params)
// };