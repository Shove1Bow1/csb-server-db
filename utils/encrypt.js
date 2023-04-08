const crypto =require('crypto');

export function encryptPassword(password){
    const cryptoPass= crypto.createHash('sha256').update(password).digest('hex');
    return cryptoPass;
}

module.exports={
    encryptPassword,
}