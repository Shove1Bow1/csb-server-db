const { Schema,Model } = require('../config/mongoose.config')
const Providers = new Schema({
    name: {
        type: String,
        name: "provider_name",
    },
    region: {
        name: {
            type: String,
            default: 'VN',
            name:"name"
        },
        region_phone: {
            type: String,
            default: '+84',
            name:"region_phone"
        }
    }
})
const ProvidersSchema=Model('Providers',Providers);
module.exports={
    ProvidersSchema,
}