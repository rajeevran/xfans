var config = require('./config');
var FCM = require('fcm-node')
let mongo = require('mongodb')
let ObjectID = mongo.ObjectID
var fcmServerKey = config.production.FCM_SERVER_KEY;
console.log('fcmServerKey---',fcmServerKey)
const serverKey = fcmServerKey //put your server key here
const fcm = new FCM(serverKey);
var NotificationsSchema = require('../schema/api/notification');

let fcmNotification = {

    fcmSentPush : async function(data = '', userDeviceId = '', msgBody= '') {
    var title = '';
    console.log('-----fcmSentPush----call-------',fcm)
    if(data.title != ''){
        title = data.title;
    }else {
        title = "Calaf"
    }
    let sendData = {title:data.title,notificationType:'Search'}


    let Response = ''
    const message = {
        to: userDeviceId,
        notification: {
            title: data.title, 
            body: msgBody,
            sound: "default",
            icon: "ic_launcher",
            tag : sendData,
            content_available : true,
        },
        
        data: {  //you can send only notification or only data(or include both)
            'title' : data.title,
            'body' : msgBody,
            'tag' : sendData
        }
    };
    console.log('message----',message)
    

    return await sendNotification(message,msgBody, data)
}
}

function sendNotification(message,msgBody, data)
{
    console.log('--------Send notification started --->')
    let Response = ''

    fcm.send(message, async function(err, response){
        if (err) {
            //console.log("Something has gone wrong!", err);
            return Response = {
                isSuccess: false,
                message: 'User deviceId is wrong or missing.'
            };
        } else {
            console.log('--------enter into notification --->',response)

            if(JSON.parse(response).success == '1'){
                console.log('--------notification ok--->')

                if(data.excludeUserId != ''){

                    //from_user,message,NotificationsSchema 
                    let notificationdata = {
                        _id      : new ObjectID,
                        fromUser : data.excludeUserId,
                        toUser   : data.toUser,
                        message  : msgBody
                    }
                    await NotificationsSchema.create(notificationdata)
                }

                return Response = {
                    isSuccess: true,
                    message: 'Push notification sent successfully to the user.'
                };
            }
        }
    });

    return Response

}

module.exports = fcmNotification