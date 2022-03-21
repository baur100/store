import express from 'express';

const router = express.Router();

// router.get('/api', (req, res) => {
//     res.status(200);
// });


router.get('/api', (req, res) => {
    res.status(200).send({
        success: 'true',
        message: 'Run testing app',
        version: '1.0.0',
    });
    // return res.status(200).json({message:'ok'})
});

export default router;