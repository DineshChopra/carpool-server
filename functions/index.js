const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBgzf8Wj1gnyZe3Slv2pJL450yJRtXUJRM",
    authDomain: "carpool-712cd.firebaseapp.com",
    databaseURL: "https://carpool-712cd.firebaseio.com",
    projectId: "carpool-712cd",
    storageBucket: "carpool-712cd.appspot.com",
    messagingSenderId: "23910179336"
});
function getSubscribeUsers() {
    const ref = firebaseApp.database().ref('subscribeUsers');
    return ref.once('value').then(user => user.val());
}
const app = express();
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
exports.app = functions.https.onRequest(app);
