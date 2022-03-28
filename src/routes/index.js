import express from 'express';

const router = express.Router();

export const rootHandler = (req,res) => {
    return res.status(200).send({
        success: 'true',
        message: 'Server alive! please use /api-docs',
        version: '1.0.0',
    });
}


export default router.get('/api', rootHandler);