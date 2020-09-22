const functions = require("firebase-functions");
const stripe = require("stripe")(functions.config().stripe.key);

exports.payment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  stripe.charges
    .create(
      {
        amount: data.amount,
        currency: data.currency,
        source: data.source,
        application_fee_amount: data.fee
      },
      {
        stripe_account: data.account
      }
    )
    .then(charge => {
      return charge;
    })
    .catch(err => {
      console.error(`Error in charge`, err);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "We couldn't process the payment."
      );
    });
});
