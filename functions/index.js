//Initialize functions and admin sdk
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

//create a subject item in the db
exports.createSubject = functions.database
  .ref("/files/{pushId}/") //reference to file being written to
  .onWrite(snapshot => {
    const newData = snapshot.after.val(); //data after write action, we only consider creation
    let flag = true; //used to check if a subject is available in the existing list of subject

    const subjectsRef = admin
      .database()
      .ref()
      .child("/subjects/"); //reference to subject list

    //get value of all items in the subject list
    subjectsRef.once('value').then(snapshot => {
        //iterate through all items in the subject list, use exception to make iteration efficient in later stage
        snapshot.forEach(element => {
          if (element.val() === newData.subjectName) {
            flag = false;
          }
        });

        //if new item being pushed is not already in the subejct list
        if (flag) {
          console.log("New subject created");
          return subjectsRef.push().set(newData.subjectName); //push item to subject list
        }
        return null;
      })
      .catch(error => console.log('Error creating subject: ', error));

    return null;
  });

//send notifications to all users
exports.sendNotification = functions.database
  .ref("/files/{pushId}")
  .onWrite(snapshot => {
    const messenger = admin.messaging();
    const message = {
      android: {
        ttl: 3600 * 5000, // 5 hours in milliseconds
        priority: "normal",
        notification: {
          title: `${snapshot.after.val().subjectName} Notes`,
          body: `${
            snapshot.after.val().subjectName
          } notes have been uploaded. Click to check`,
          color: "#298456"
        }
      },
      topic: "RCN", //send to devices subscribed to topic 'RCN'
      data: {
        crap: "" //fill with subject name to open the subject activity later
      }
    };

    //send message
    messenger
      .send(message)
      .then(response => console.log("Message pushed to users"))
      .catch(error => console.log("Error:", error));
    return null;
  });