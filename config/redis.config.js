require('dotenv').config();
const {createClient}=require('redis');
const client=createClient({
    url: process.env.REDIS_URI
})
module.exports= {
    client   
}