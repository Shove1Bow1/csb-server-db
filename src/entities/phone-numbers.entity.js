const dayjs = require("dayjs");
const { Schema, Model } = require("../../config/mongoose.config");
const PhoneNumbers = new Schema(
  {
    mobileCodeId: {
      require: true,
      type: Number,
      name: "mobileCodeId",
    },
    reportList: [
      {
        _id: {
          type: String,
          name: "_id",
        },
        deviceCodeId: {
          type: String,
          name: "deviceCodeId",
          index: true,
        },
        content: {
          type: String,
          name: "content",
        },
        reportDate: {
          type: Date,
          default: new Date(),
          name: "reportDate",
          index: true,
        },
        title: {
          type: String,
          name: "title",
        },
      },
    ],
    callTracking: [
      {
        deviceCodeId: {
          type: String,
          name: "deviceCodeId",
          index: true,
        },
      },
    ],
    phoneNumber: {
      type: String,
      name: "phoneNumber",
      index: true,
    },

    status: {
      type: String,
      default: "reported",
      name: "status",
      index: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
      name: "isDelete",
    },
    createdAt: {
      type: Number,
      default: dayjs(Date.now()).unix(),
      name: "createAt",
    },
  },
  { timestamps: true }
);
const PhoneNumbersSchema = Model("phone_numbers", PhoneNumbers);
PhoneNumbersSchema.createIndexes({
  phoneNumber: "text",
});
module.exports = {
  PhoneNumbersSchema,
};
