import { KJUR } from 'jsrsasign';

const config = process.env;

const checkToken = (token, publicKey) => {
    return KJUR.jws.JWS.verify(token, publicKey.replace(/\\n/gm, '\n'), ['RS256']);
}

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let isValid;
    if(authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            isValid = checkToken(token,config.PUBLIC_KEY)
            if(!isValid){
                return res.status(403).send({ message: 'Invalid signature' });
            }
            const decoded = KJUR.jws.JWS.parse(token).payloadObj
            const time = Math.round(Date.now() / 1000);
            if (time >= decoded.exp) {
                return res.status(400).send({ message: 'Token has been expired' });
            }
            req.user = decoded;
        } catch (err) {
            return res.status(400).send({error:'Invalid Token'});
        }
    } else {
        return res.status(403).send({message:'A token is required for authentication'});
    }
    return next();
};

export default {verifyToken};