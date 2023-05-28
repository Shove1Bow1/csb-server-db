const {WebClient}=require('@slack/web-api');

const token=process.env.SLACK_TOKEN;
const slackClient=new WebClient(token);
function reportWithSlack(phoneNumber){
    console.log("1")
    slackClient.chat.postMessage({
        text:"Số điện thoại "+phoneNumber+" nhận 1 report.",
        channel: "csb-notifications"
    });
}
function requestUnbanNumberWithSlack(phoneNumber,reason){
    slackClient.chat.postMessage({
        text:"Số điện thoại "+phoneNumber+" xin được hạ xuống potential-spammer.\nLý do: "+reason,
        channel: "csb-unban"
    })
}
module.exports={
    reportWithSlack,
    requestUnbanNumberWithSlack
}