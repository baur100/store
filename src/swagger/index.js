import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv  from 'dotenv';

dotenv.config();
const swaggerRoute = express.Router();
const replacements = {
    url: process.env.SCHEME+'://'+process.env.HOST+'/api'
};

const swaggerSpec = YAML.load('src/swagger/swagger.yaml');
const swaggerString = JSON.stringify(swaggerSpec);
const string = swaggerString.replace(/{\w+}/g,    placeholder => {
    const placeholderName = placeholder.substring(1, placeholder.length - 1);
    return replacements[placeholderName] || placeholder;
});

swaggerRoute.use('/api-docs', swaggerUi.serve);
swaggerRoute.get('/api-docs', swaggerUi.setup(JSON.parse(string)));

export default swaggerRoute;