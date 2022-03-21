import express from 'express';

const swaggerRoute = express.Router();
import swaggerUi from 'swagger-ui-express';
import swagger from './swagger.js';

swaggerRoute.use('/api-docs', swaggerUi.serve);
swaggerRoute.get('/api-docs', swaggerUi.setup(swagger));

export default swaggerRoute;