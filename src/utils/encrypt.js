const {jwt} = require('../../config/jwt.config');
const {JWT_KEY }=require('../constant/env');
const {uuid}= require('uuidv4');
const crypto =require('crypto');

function encryptPassword(password){
    const cryptoPass= crypto.createHash('sha256').update(password).digest('hex');
    return cryptoPass;
}
function encryptToJWT(name,jwtKey){
    const jwtEncryption= jwt.sign({
        name
    },jwtKey,{expiresIn:"1d"});
    return jwtEncryption;
}
function encryptMobileDevice(deviceId){
    const cryptoDevice= crypto.createHash('sha256').update(deviceId).digest('hex');
    return cryptoDevice;
}
function randomKey(){
    const randomString=uuid();
    return randomString;
}
module.exports={
    encryptPassword,
    encryptToJWT,
    encryptMobileDevice,
    randomKey
};