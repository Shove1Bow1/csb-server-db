const { MobileCodesSchema } = require('../entities/mobile-codes.entity');
const mobileCodeSchema = MobileCodesSchema;
async function getMobileCodeId(mobileCode) {
    try {
        const mobile = await mobileCodeSchema.findOne({ code: String(mobileCode) });
        if (!mobile)
            throw new Error('fuck you');
        else {
            return mobile._id;
        }
    }
    catch (error) {
        return error;
    }
}
async function getMobileCode(mobileCodeId) {
    const mobileCode = await mobileCodeSchema.findById(mobileCodeId);
    if (!code) {
        throw { message: 'Code not exist', status: '404' };
    }
    return mobileCode.code;
}
module.exports = {
    getMobileCodeId,
    getMobileCode,
};