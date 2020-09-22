const functions = require("firebase-functions");

const { firestore } = require("../../../admin");
const utils = require("../../utils");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  let { doc, field } = await utils.userUpdate.getUserField(
    context.auth.uid,
    "settings"
  );

  // If settings data is undefined, reject request
  if (typeof field === "undefined") {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  // Handle clearedQuestions
  if (
    Object.prototype.hasOwnProperty.call(data, "clearedQuestions") &&
    typeof data.clearedQuestions === "object" &&
    Array.isArray(data.clearedQuestions)
  ) {
    let clearedQuestions = [];
    data.clearedQuestions.forEach(clearedQuestion => {
      if (typeof clearedQuestion === "object") {
        clearedQuestions.push(
          firestore.collection("songstory_questions").doc(clearedQuestion.id)
        );
      }
      if (typeof clearedQuestion === "string") {
        clearedQuestions.push(
          firestore.collection("songstory_questions").doc(clearedQuestion)
        );
      }
    });
    field.clearedQuestions = clearedQuestions;
  }

  // Handle privacy
  if (Object.prototype.hasOwnProperty.call(data, "privacy")) {
    field.privacy = data.privacy;
  }

  utils.userUpdate.validateSettings(field);

  // If there are rejections, throw error
  let rejections = utils.userUpdate.rejections;
  if (rejections.length > 0) {
    utils.userUpdate.clearRejections();
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Settings fields invalid.",
      { rejections }
    );
  }

  await doc.update({ settings: field });

  return Object.assign({}, field, {
    clearedQuestions: field.clearedQuestions.map(doc => doc.path)
  });
});
