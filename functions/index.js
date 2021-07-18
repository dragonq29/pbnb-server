const functions = require("firebase-functions");
const axios = require("axios");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.menu = functions
  .region("asia-northeast1") // asia-northeast1:Tokyo(=Tire1 / cheaper than Seoul=Tire2)
  .https.onRequest((request, response) => {
    response.set("Access-Control-Allow-Origin", "https://dragonq29.github.io");
    axios
      .post(
        "https://sfv.hyundaigreenfood.com/smartfood/todaymenuGf/todayMenu_nList_pro.do",
        request.body
      )
      .then((res) => response.send({ ...res.data }))
      .catch((err) => response.send({ ...err.message }));
  });

exports.health = functions
  .region("asia-northeast1") // asia-northeast1:Tokyo(=Tire1 / cheaper than Seoul=Tire2)
  .https.onRequest((_, response) => {
    response.send({ status: "fully functional" });
  });
