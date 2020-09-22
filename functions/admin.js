const admin = require("firebase-admin");

admin.initializeApp();

const auth = admin.auth();
const database = admin.database();
const firestore = admin.firestore();
const firestoreObj = admin.firestore;
const storage = admin.storage();

module.exports = {
  auth,
  database,
  firestore,
  firestoreObj,
  storage
};
