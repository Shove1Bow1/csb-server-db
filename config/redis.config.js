require('dotenv').config();
const {createClient}=require('redis');
const clientRedis=createClient({
    url: process.env.REDIS_URI
})
module.exports= {
    clientRedis   
}