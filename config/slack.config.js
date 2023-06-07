const { WebClient } = require('@slack/web-api');
const { logError } = require('./fs.config');

const token = process.env.SLACK_TOKEN;
const slackClient = new WebClient(token);
function reportWithSlack(phoneNumber) {
    try {
        slackClient.chat.postMessage({
            text: "Số điện thoại " + phoneNumber + " nhận 1 report.",
            channel: "csb-notifications"
        });
    }
    catch (error) {
        logError(error);
    }
}
function requestUnbanNumberWithSlack(phoneNumber, reason, email) {
    try {
        slackClient.chat.postMessage({
            text: "Email người gửi:" + (email || "unknown") + "\nSố điện thoại " + phoneNumber + " xin được hạ xuống potential-spammer.\nLý do: " + reason,
            channel: "csb-unban"
        })
    }
    catch (error) {
        logError(error);
    }
}
module.exports = {
    reportWithSlack,
    requestUnbanNumberWithSlack
}