import express from 'express';
import cors from 'cors';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import routes from './routes/index.js';
import swagger from './swagger/index.js';
import path from 'path';
import productRoute from './routes/product.routes.js';
import authRoute from './routes/auth.routes.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use(cors());

app.use(routes);
app.use(swagger);
routes.get('/', (req, res)=>{
    res.sendFile('index.html', { root: path.join(__dirname, './') });
});

app.use('/api/product', productRoute);
app.use('/api/user', authRoute);

// Error handling
app.use((req, res) => {
    const  fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const error = new Error(`404 - resource not found ${fullUrl}`);
    return res.status(404).json({
        message: error.message,
    });
});

export default app;