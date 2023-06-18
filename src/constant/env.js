require('dotenv').config();

const JWT_KEY= process.env.JWT_KEY;
const AUTHORIZATION_CODE = process.env.AUTHORIZATION_CODE;
const ES_PHONE_NUMBERS=process.env.ES_PHONE_NUMBERS;
module.exports={
    JWT_KEY,
    AUTHORIZATION_CODE,
    ES_PHONE_NUMBERS
};