require('dotenv').config();

const JWT_KEY= process.env.JWT_KEY;
const AUTHORIZATION_CODE = process.env.AUTHORIZATION_CODE;

module.exports={
    JWT_KEY,
    AUTHORIZATION_CODE
}