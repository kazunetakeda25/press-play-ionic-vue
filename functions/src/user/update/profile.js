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
    "profile"
  );

  // If profile data is undefined, reject request
  if (typeof field === "undefined") {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  // Handle firstname
  if (Object.prototype.hasOwnProperty.call(data, "firstname")) {
    field.firstname = data.firstname;
  }

  // Handle lastname
  if (Object.prototype.hasOwnProperty.call(data, "lastname")) {
    field.lastname = data.lastname;
  }

  // Handle birthdate
  if (Object.prototype.hasOwnProperty.call(data, "birthdate")) {
    field.birthdate = data.birthdate;
  }

  // Handle bio
  if (Object.prototype.hasOwnProperty.call(data, "bio")) {
    field.bio = data.bio;
  }

  // Handle gender
  if (Object.prototype.hasOwnProperty.call(data, "gender")) {
    field.gender = data.gender;
  }

  // Handle location
  if (Object.prototype.hasOwnProperty.call(data, "location")) {
    field.location = data.location;
  }

  utils.userUpdate.validateProfile(field);

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

  await doc.update({ profile: field });

  return { field };
});
