const {jwt} = require('../../config/jwt.config');
const {JWT_KEY }=require('../constant/env');

const crypto =require('crypto');

function encryptPassword(password){
    const cryptoPass= crypto.createHash('sha256').update(password).digest('hex');
    return cryptoPass;
}
function encryptToJWT(name){
    const jwtEncryption= jwt.sign({
        name
    },JWT_KEY,{expiresIn:"1d"});
    return jwtEncryption;
}

module.exports={
    encryptPassword,
    encryptToJWT,
};