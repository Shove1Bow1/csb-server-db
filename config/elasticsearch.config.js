require("dotenv").config();
const { Client } = require('@elastic/elasticsearch')
const csbClient = new Client({
    node: {
        url: new URL(process.env.ES_URI),
        maxRetries: 10,
        requestTimeout: 2000,
        auth: {
            username: process.env.ES_USER,
            password: process.env.ES_PASSWORD,
        },
        tls:{rejectUnauthorized:false}
    }
})
module.exports = {
    csbClient,
}