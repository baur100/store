import express from 'express';

const router = express.Router();

router.get('/api', (req, res) => {
    res.status(200).send({
        success: 'true',
        message: 'Run testing app',
        version: '1.0.0',
    });
});

export default router;