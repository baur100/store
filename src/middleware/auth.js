import { KJUR } from 'jsrsasign';
import parser from 'xml2js';

const config = process.env;

const checkToken = (token, publicKey) => {
    return KJUR.jws.JWS.verify(token, publicKey.replace(/\\n/gm, '\n'), ['RS256']);
};

let error;
let resp;

const convertErrorToXml = (error) =>{
    const obj = {error};
    const builder = new parser.Builder();
    return builder.buildObject(obj);
};

const verifyToken = (req, res, next) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const authHeader = req.headers.authorization;
    let isValid;
    if(authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            isValid = checkToken(token,config.PUBLIC_KEY);
            if(!isValid){
                resp = {error: 'Invalid signature'};
                error = isXmlResponse ? convertErrorToXml(resp) : resp;
                return res.status(403).send(error);
            }
            const decoded = KJUR.jws.JWS.parse(token).payloadObj;
            const time = Math.round(Date.now() / 1000);
            if (time >= decoded.exp) {
                resp = {error: 'Token has been expired'};
                error = isXmlResponse ? convertErrorToXml(resp) : resp;
                return res.status(400).send(error);
            }
            req.user = decoded;
        } catch (err) {
            resp = {error: 'Invalid Token'};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
    } else {
        resp = {error: 'A token is required for authentication'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(401).send(error);
    }
    return next();
};

const veryAdmin=(req, res, next) => {
    const isXmlResponse = req.headers['accept'].split('/')[1].includes('xml');
    const authHeader = req.headers.authorization;
    let isValid;
    if(authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            isValid = checkToken(token,config.PUBLIC_KEY);
            if(!isValid){
                resp = {error: 'Invalid signature'};
                error = isXmlResponse ? convertErrorToXml(resp) : resp;
                return res.status(403).send(error);
            }
            const decoded = KJUR.jws.JWS.parse(token).payloadObj;
            const time = Math.round(Date.now() / 1000);
            if (time >= decoded.exp) {
                resp = {error: 'Token has been expired'};
                error = isXmlResponse ? convertErrorToXml(resp) : resp;
                return res.status(400).send(error);
            }
            req.user = decoded;
        } catch (err) {
            resp = {error: 'Invalid Token'};
            error = isXmlResponse ? convertErrorToXml(resp) : resp;
            return res.status(400).send(error);
        }
    } else {
        resp = {error: 'A token is required for authentication'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(401).send(error);
    }
    if(req.user.role === 2){
        resp = {error: 'User doesn\'t have proper permissions'};
        error = isXmlResponse ? convertErrorToXml(resp) : resp;
        return res.status(403).send(error);
    }
    return next();
};

export default {verifyToken, veryAdmin};