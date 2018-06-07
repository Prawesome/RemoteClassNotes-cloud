const functions = require("firebase-functions");
const admin = require("firebase-admin");
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

    const subjectsRef = admin
      .database()
      .ref();
    console.log(subjectsRef.toJSON());

    // subjectsRef.forEach(element => {
    //   if (element === newData.subjectName) {
    //     return null;
    //   }
    // });

    return subjectsRef.push().set(newData.subjectName);
  });

exports.sendNotification = functions.database
  .ref("/files/{pushId}")
  .onWrite(snapshot => {
    const messenger = admin.messaging();
    const message = {
      android: {
        ttl: 3600 * 5000, // 5 hours in milliseconds
        priority: "normal",
        notification: {
          title: "Class Notes",
          body: `${
            snapshot.after.val().subjectName
          } notes have been uploaded. Click to check`,
          color: "#298456"
        }
      },
      topic: "RCN",
      data: {
        crap: "" //fill with subject name to open the subject activity later
      }
    };

    messenger
      .send(message)
      .then(response => console.log("Message pushed to users"))
      .catch(error => console.log("Error:", error));
    return null;
  });
