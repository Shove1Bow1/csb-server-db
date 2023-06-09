const { Schema, Model } = require("../../config/mongoose.config");
const PhoneNumbers = new Schema(
  {
    mobileCodeId: {
      require: true,
      type: Number,
      name: "mobileCodeId",
    },
    searchTracked: [
      {
        dateSearch: {
          type: String,
          name: "dateTracker",
          index: true,
        },
        numberSearch: {
          type: Number,
          name: "numberOfCall",
          index: true,
        },
      },
    ],
    reportList: [
      {
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
    phoneNumber: {
      type: String,
      name: "phoneNumber",
      index: true,
    },
    callTracker: [
      {
        dateTracker: {
          type: String,
          name: "dateTracker",
          index: true,
        },
        numberOfCall: {
          type: Number,
          name: "numberOfCall",
          index: true,
        },
      },
    ],
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
    stateUnban: {
      type: Boolean,
      default: false,
      name: "stateUnban",
    },
    wasUpdated: {
      type: Boolean,
      default: false,
      name: "wasASpammer",
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
