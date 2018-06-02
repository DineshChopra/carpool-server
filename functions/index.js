const express = require('express');
const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const bodyParser = require('body-parser');
const webpush = require('web-push');

const vapidKeys = {
    "publicKey" : "BGqNfVOgHMHNGCc_1hvXEGgfxc4nUONZQ3PAHFJHP4JBjJzdqioWq5RLU1CcIit-Y9j8Rw8srt1h8UycluYa7ps",
    "privateKey" : "Oa_x8uENj80lnZoR853B4pc7n_I_9wAUQtKYrFb2Dow"
  };

  webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*.*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBgzf8Wj1gnyZe3Slv2pJL450yJRtXUJRM",
    authDomain: "carpool-712cd.firebaseapp.com",
    databaseURL: "https://carpool-712cd.firebaseio.com",
    projectId: "carpool-712cd",
    storageBucket: "carpool-712cd.appspot.com",
    messagingSenderId: "23910179336"
});
var SubscribeUsers = undefined;
function intializeSubscribeUsers() {
    if(SubscribeUsers){
        return SubscribeUsers;
    }else {
        SubscribeUsers = firebaseApp.database().ref('subscribeUsers');
    }
    console.log('SubscribeUsers ', SubscribeUsers);
}
function getSubscribeUsers() {
    const ref = intializeSubscribeUsers();
    return ref.once('value').then(user => user.val());
}
const app = express();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    if (req.method === "OPTIONS") 
        res.send(200);
    else 
        next();
});
app.use(bodyParser.json());

app.get('/timestamp', (req, res) => {
    res.send(`${Date.now()}`);
});

app.get('/sendPushNotification', (req, res) => {
    getSubscribeUsers().then(users => {
        res.send(users);
    });
    // const list = [1,2,3,4,5];
    // console.log('list --------- : ', list);
    // res.send(`${list}`);
})
app.post('/sendPushNotification', (req, res) => {
    const ref = intializeSubscribeUsers();
    ref.push({user : 'TEst user'}).then(res => {
        res.send(res);
    }, err => {
        res.send(err);
    })
})
const USER_SUBSCRIPTIONS = [];
app.post('/notification/subscribe', (req, res) => {
    console.log('notification subscribe is called -------');
    const sub = req.body;
    USER_SUBSCRIPTIONS.push(sub);
    console.log('sub :: ', sub);
    res.status(200).json({message: "Subscription added successfully"});
})

app.post('/notification/send', (req, res) => {

    // sample notification payload
    const notificationPayload = {
        "notification": {
            "title": "Angular News",
            "body": "Newsletter Available!",
            "icon": "assets/main-page-logo-small-hat.png",
            "vibrate": [100, 50, 100],
            "data": {
                "dateOfArrival": Date.now(),
                "primaryKey": 1
            },
            "actions": [{
                "action": "explore",
                "title": "Go to the site"
            }]
        }
    };

    Promise.all(USER_SUBSCRIPTIONS.map(sub => webpush.sendNotification(
        sub, JSON.stringify(notificationPayload) )))
        .then(() => res.status(200).json({message: 'Newsletter sent successfully.'}))
        .catch(err => {
            console.error("Error sending notification, reason: ", err);
            res.sendStatus(500);
        });

})
app.get('/notification/send', (req, res) => {
    console.log('test get is called --------');
    res.status(200).json({message: "Get request successfully"});
})
exports.app = functions.https.onRequest(app);
