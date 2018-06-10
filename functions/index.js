const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

exports.createSubject = functions.database
  .ref("/files/{pushId}/")
  .onWrite(snapshot => {
    const oldData = snapshot.before.val();
    const newData = snapshot.after.val();
    let flag = true;

    const subjectsRef = admin
      .database()
      .ref()
      .child("/subjects/");

    subjectsRef.once('value').then(snapshot => {
      snapshot.forEach(element => {
        console.log(flag);
        console.log(element.val());
        if (element.val() === newData.subjectName) {
          flag = false;
        }
      });
      if (flag) {
        console.log("New subject created");
        return subjectsRef.push().set(newData.subjectName);
      }
      return null;
    }).catch( error => console.log('Error creating subject: ', error));

    return null;
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