const { Schema, Model } = require("../../config/mongoose.config");
const Providers = new Schema({
  _id: {
    type: Number,
    name: "_id",
  },
  name: {
    type: String,
    name: "name",
  },
  region: {
    regionName: {
      type: String,
      default: "VN",
      name: "regionName",
    },
    regionCode: {
      type: String,
      default: "+84",
      name: "regionCode",
    },
  },
});
const ProvidersSchema = Model("providers", Providers);
module.exports = {
  ProvidersSchema,
};
