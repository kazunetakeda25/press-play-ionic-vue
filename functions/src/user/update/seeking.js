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
    "seeking"
  );

  // If seeking data is undefined, reject request
  if (typeof field === "undefined") {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  // Handle maxDistance
  if (Object.prototype.hasOwnProperty.call(data, "maxDistance")) {
    field.maxDistance = data.maxDistance;
  }

  // Handle minScore
  if (Object.prototype.hasOwnProperty.call(data, "minScore")) {
    field.minScore = data.minScore;
  }

  // Handle relationships
  if (Object.prototype.hasOwnProperty.call(data, "relationships")) {
    field.relationships = data.relationships;
  }

  // Validate seeking
  utils.userUpdate.validateSeeking(field);

  // If there are rejections, throw error
  let rejections = utils.userUpdate.rejections;
  if (rejections.length > 0) {
    utils.userUpdate.clearRejections();
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Seeking fields invalid.",
      { rejections }
    );
  }

  await doc.update({ seeking: field });

  return { field };
});
