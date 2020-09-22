const functions = require("firebase-functions");
const max = require("lodash/max");
const merge = require("lodash/merge");
const reverse = require("lodash/reverse");
const { v4: uuidv4 } = require("uuid");

const { firestore, firestoreObj } = require("../../../admin");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check if valid data
  if (
    !Object.prototype.hasOwnProperty.call(data, "answerLimit") &&
    typeof data.answerLimit !== "number" &&
    data.answerLimit > 0 === false &&
    !Object.prototype.hasOwnProperty.call(data, "answerLimitRequired") &&
    typeof data.answerLimitRequired !== "boolean" &&
    !Object.prototype.hasOwnProperty.call(data, "creditUser") &&
    typeof data.creditUser !== "boolean" &&
    !Object.prototype.hasOwnProperty.call(data, "category") &&
    typeof data.category !== "string" &&
    data.category.length > 0 === false &&
    !Object.prototype.hasOwnProperty.call(data, "multipleAnswers") &&
    typeof data.multipleAnswers !== "number" &&
    !Object.prototype.hasOwnProperty.call(data, "searchTypes") &&
    typeof data.searchTypes !== "object" &&
    !Array.isArray(data.searchTypes) &&
    data.searchTypes.length > 0 === false &&
    !Object.prototype.hasOwnProperty.call(data, "question") &&
    typeof data.question !== "string" &&
    data.question.length > 0 === false &&
    data.question.length <= 140 === false
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with valid data fields."
    );
  }

  // Lookup category
  let songstoryCategory = await firestore
    .collection("songstory_categories")
    .doc(data.category)
    .get();

  if (!songstoryCategory.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "SongStory category not found!"
    );
  }

  // Setup submit config
  let submitConfig = {
    acceptsDate: true,
    entryTypes: ["genre", "album", "artist", "track"],
    maxEntries: 10,
    multipleAnswers: false
  };

  // Lookup parent categories to get submit config
  let parent = songstoryCategory.get("parent");
  let next = null;
  let parentCategories = [];
  async function getParentCategory(ref) {
    await ref.get().then(snapshot => {
      let data = snapshot.data();
      next = Object.prototype.hasOwnProperty.call(data, "parent")
        ? data.parent
        : null;
      return parentCategories.push(Object.assign({}, data));
    });
    if (next !== null) {
      await getParentCategory(next);
    }
  }
  if (parent) {
    await getParentCategory(parent);
  }

  // Merge parent category configs
  reverse(parentCategories).forEach(category => {
    if (category.submitConfig) {
      submitConfig = merge(submitConfig, category.submitConfig);
    }
  });

  // Merge this category config lastly
  let categoryConfig = songstoryCategory.get("submitConfig");
  if (categoryConfig) {
    submitConfig = merge(submitConfig, categoryConfig);
  }

  // Get question priority
  let songstoryQuestionPriorities = await firestore
    .collection("songstory_questions")
    .where("category", "==", songstoryCategory.ref)
    .get()
    .then(querySnapshot => {
      return querySnapshot.docs.map(doc =>
        doc.get("priority") ? doc.get("priority") : 0
      );
    });

  if (songstoryQuestionPriorities.length === 0) {
    songstoryQuestionPriorities.push(0);
  }

  let maxPriority = max(songstoryQuestionPriorities);
  let priority =
    maxPriority === undefined || maxPriority === 0 ? 0 : maxPriority + 1;

  // Handle answerLimit
  let answerLimit =
    data.answerLimit < submitConfig.maxEntries
      ? data.answerLimit
      : submitConfig.maxEntries;

  // Handle answerLimitRequired
  let answerLimitRequired = answerLimit === 1 ? true : data.answerLimitRequired;

  // Handle multiple answers
  let multipleAnswers = submitConfig.multipleAnswers
    ? Boolean(data.multipleAnswers)
    : false;

  // Setup question data
  let timestamp = firestoreObj.FieldValue.serverTimestamp();
  let uid = context.auth.uid;
  let question = {
    acceptsDate: submitConfig.acceptsDate,
    answerLimit: answerLimit,
    answerLimitRequired: answerLimitRequired,
    category: songstoryCategory.ref,
    created: timestamp,
    creditUser: data.creditUser,
    multipleAnswers: multipleAnswers,
    priority: priority,
    published: false,
    question: data.question,
    searchMode: "search",
    searchTypes: data.searchTypes,
    submittedBy: uid,
    updated: timestamp
  };

  // Set searchMode
  if (question.answerLimitRequired) {
    if (question.answerLimit > 1) {
      question.searchMode = "picker";
    }
    if (question.answerLimit > 5) {
      question.searchMode = "grid";
    }
  }

  // Set question id to something readable
  let categoryId = songstoryCategory.id;
  let sanitizedQuestion = question.question.replace(
    /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g,
    ""
  );
  let threeWords = sanitizedQuestion
    .split(" ")
    .slice(0, 3)
    .join("_");
  let uniqId = uuidv4()
    .replace("-", "")
    .substring(0, 20);
  let questionId = [categoryId, threeWords.toLowerCase(), uniqId].join("_");

  // Create document reference
  let questionDoc = firestore.collection("songstory_questions").doc(questionId);

  // Save to firestore
  try {
    console.log(`Creating '${questionDoc.path}' user submission.`);
    await firestore.runTransaction(transaction => {
      transaction.set(questionDoc, question);
      return Promise.resolve();
    });
    console.log(`Created '${questionDoc.path}' user submission.`);
    return { data };
  } catch (err) {
    console.error(
      `Error when creating '${questionDoc.path}' user submission.`,
      err
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "We couldn't accept your submission at this time."
    );
  }
});
