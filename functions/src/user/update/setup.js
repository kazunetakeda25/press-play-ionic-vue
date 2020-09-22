const functions = require("firebase-functions");
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
    "setup"
  );

  // If setup data is undefined, reject request
  if (typeof field === "undefined") {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  // Handle complete
  if (Object.prototype.hasOwnProperty.call(data, "complete")) {
    field.complete = data.complete;
  }

  // Handle completed
  if (Object.prototype.hasOwnProperty.call(data, "completed")) {
    field.completed = data.completed;
  }

  // Handle next
  if (Object.prototype.hasOwnProperty.call(data, "next")) {
    field.next = data.next;
  }

  utils.userUpdate.validateSetup(field);

  // If there are rejections, throw error
  let rejections = utils.userUpdate.rejections;
  if (rejections.length > 0) {
    utils.userUpdate.clearRejections();
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Profile fields invalid.",
      { rejections }
    );
  }

  await doc.update({ setup: field });

  return { field };
});
