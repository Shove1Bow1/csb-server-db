import { jwt } from '../../config/jwt.config';
import { JWT_KEY } from '../constant/env';

const crypto =require('crypto');

export function encryptPassword(password){
    const cryptoPass= crypto.createHash('sha256').update(password).digest('hex');
    return cryptoPass;
}
export function encryptToJWT(name){
    const jwtEncryption= jwt.sign({
        name
    },JWT_KEY,{expiresIn:"1d"})
    return jwtEncryption;
}

module.exports={
    encryptPassword,
    encryptToJWT,
}