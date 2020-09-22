const functions = require("firebase-functions");

const { auth, firestore, firestoreObj } = require("../../admin");
const utils = require("../utils");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  // Check for valid UID string
  if (
    !Object.prototype.hasOwnProperty.call(data, "uid") &&
    typeof data.uid !== "string" &&
    data.uid.length > 0 &&
    !Object.prototype.hasOwnProperty.call(data, "message") &&
    typeof data.message !== "string" &&
    data.message.length > 0 === false
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid uid."
    );
  }

  // Set user1
  let user1 = context.auth.uid;

  // Get user2
  let user2 = await auth
    .getUser(data.uid)
    .then(user => {
      return user.uid;
    })
    .catch(() => {
      throw new functions.https.HttpsError("not-found", "User not found.");
    });

  // Check if either user has blocked the other
  let user1blocked2 = await utils.blockedUsers.isUserBlocked(user1, user2);
  let user2blocked1 = await utils.blockedUsers.isUserBlocked(user2, user1);
  if (user1blocked2 || user2blocked1) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "This conversation has been disabled."
    );
  }

  // Look for existing conversations
  let userPair = [`${user1}:${user2}`, `${user2}:${user1}`];
  let conversations = await firestore
    .collection("conversations")
    .where("userPair", "in", userPair)
    .limit(1)
    .get();

  // Get timestamp
  let timestamp = firestoreObj.FieldValue.serverTimestamp();

  // Build conversation objects
  let conversationTransaction = "set";
  let conversationRef = firestore.collection("conversations").doc();
  let conversation = {
    accepted: false,
    created: timestamp,
    enabled: true,
    lastMessage: data.message,
    updated: timestamp,
    user1: user1,
    user1Browse: null,
    user2: user2,
    user2Browse: null,
    userPair: `${user1}:${user2}`
  };

  // If there is an existing conversation, check that it's enabled and overwrite conversation objects
  if (conversations.empty === false) {
    if (conversations.docs[0].get("enabled") === true) {
      conversationTransaction = "update";
      conversationRef = conversations.docs[0].ref;
      conversation = {
        updated: timestamp,
        lastMessage: data.message
      };
    } else {
      throw new functions.https.HttpsError(
        "permission-denied",
        "This conversation has been disabled."
      );
    }
  } else {
    // This is a new conversation

    // Lookup songmate and set conversation.accepted to be based on isSongmate
    let songmateLookup = await utils.songmates.lookup(user1, user2);
    conversation.accepted = songmateLookup.isSongmate;

    // Create users_browse docs
    let user1Browse = await utils.userBrowse.getBrowseDoc(user1, user2, null, {
      isSongmate: songmateLookup.isSongmate,
      songmatePath: songmateLookup.isSongmate
        ? songmateLookup.songmateData.path
        : null
    });
    let user2Browse = await utils.userBrowse.getBrowseDoc(user2, user1, null, {
      isSongmate: songmateLookup.isSongmate,
      songmatePath: songmateLookup.isSongmate
        ? songmateLookup.songmateData.path
        : null
    });
    conversation.user1Browse = user1Browse;
    conversation.user2Browse = user2Browse;
  }

  // Build message object
  let message = {
    attachments: [],
    message: data.message,
    read: false,
    received: null,
    sent: timestamp,
    uid: user1
  };

  // Set messageRef
  let messageRef = conversationRef.collection("messages").doc();

  // Save to firestore
  let consoleMsg = {
    running: conversationTransaction === "set" ? "Creating" : "Updating",
    success: conversationTransaction === "set" ? "Created" : "Updated"
  };
  try {
    console.log(`${consoleMsg.running} conversations/${conversationRef.id}.`);
    await firestore.runTransaction(transaction => {
      if (conversationTransaction === "set") {
        transaction.set(conversationRef, conversation);
      } else {
        transaction.update(conversationRef, conversation);
      }
      transaction.set(messageRef, message);
      return Promise.resolve();
    });
    console.log(`${consoleMsg.success} conversations/${conversationRef.id}`);

    // Get the fresh conversation object to return it
    let conversationObj = await firestore
      .collection("conversations")
      .doc(conversationRef.id)
      .get()
      .then(snapshot => {
        return Object.assign({}, snapshot.data(), {
          id: snapshot.id,
          path: snapshot.ref.path
        });
      });
    return conversationObj;
  } catch (err) {
    console.error(
      `Error ${consoleMsg.running.toLowerCase()} conversations/${
        conversationRef.id
      }`,
      err
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "We couldn't send your message at this time."
    );
  }
});
