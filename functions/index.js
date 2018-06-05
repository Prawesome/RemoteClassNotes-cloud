const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onReques t((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createSubject = functions.database
  .ref("/files/{pushId}/")
  .onWrite(snapshot => {
    const oldData = snapshot.before.val();
    const newData = snapshot.after.val();
    const subjectsRef = admin.database().ref().child('subjects');
    
    return subjectsRef.push().set(newData.subjectName);
  });
