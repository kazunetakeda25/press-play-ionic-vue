const moment = require("moment");
const chunk = require("lodash/chunk");

const { firestore } = require("../../admin");
const userBrowse = require("./userBrowse");
class UserUpdate {
  constructor() {
    this.genderData = {
      expressions: ["none", "male", "female", "other"],
      identities: [
        "none",
        "male",
        "female",
        "nonbinary",
        "agender",
        "questioning",
        "fluid",
        "transgender",
        "intersex"
      ],
      orientations: [
        "none",
        "straight",
        "gay",
        "bisexual",
        "pansexual",
        "asexual"
      ],
      pronouns: ["female", "male", "ambiguous"]
    };
    this.privacyFields = [
      "birthdate",
      "bio",
      "gender",
      "lastname",
      "location",
      "profile"
    ];
    this.basicProfile = {
      firstname: "",
      lastname: "",
      birthdate: "",
      bio: ""
    };
    this.relationshipTypes = ["buddies", "dating", "love"];
    this.rejections = [];
  }

  addRejection(field = "", reason = "", hint = "") {
    this.rejections.push({ field, reason, hint });
  }

  clearRejections() {
    this.rejections = [];
  }

  getDefaultRelationshipType(type, data) {
    let relationshipType = {
      type: type,
      enabled: false
    };
    this.getGenderFields().forEach(field => {
      relationshipType[field] = [];
    });
    return Object.assign(relationshipType, data);
  }

  getGenderFields() {
    return Object.keys(this.genderData);
  }

  async getUserField(uid, lookup) {
    let doc = firestore.collection("users").doc(uid);
    let field = await doc.get().then(snapshot => {
      return snapshot.get(lookup);
    });
    return { doc, field };
  }

  async updateUsersBrowse(uid, data) {
    // Setup records to update
    let recordsToUpdate = [];

    let usersBrowse = await firestore
      .collection("users_browse")
      .where("user2", "==", uid)
      .get();

    await Promise.all(
      usersBrowse.docs.map(async userBrowseDoc => {
        let docData = userBrowseDoc.data();
        let userBrowseObj = await userBrowse.getBrowseDoc(
          docData.user1,
          docData.user2,
          data,
          {
            isSongmate: docData.isSongmate,
            songmatePath: docData.songmate ? docData.songmate.path : null
          },
          false
        );
        recordsToUpdate.push({
          ref: userBrowseDoc.ref,
          data: userBrowseObj.data
        });
      })
    );

    // Run recordsToUpdate
    if (recordsToUpdate.length > 0) {
      // Chunk recordsToUpdate by 500, the max batch operations limit
      let updates = 0;
      let successfullBatches = 0;
      let failedBatches = 0;
      let batchChunks = chunk(recordsToUpdate, 500);
      await Promise.all(
        batchChunks.map(async batchChunk => {
          let batch = firestore.batch();
          batchChunk.forEach(operation => {
            batch.update(operation.ref, operation.data);
          });
          await batch
            .commit()
            .then(() => {
              // Log to console
              console.log(
                `users_browse update batch for ${uid} succesfully ran. Updated: ${updates}`
              );
              // Add to successful batches
              successfullBatches++;
              updates = 0;
              return true;
            })
            .catch(err => {
              // Log to console
              console.error(
                `users_browse update batch for ${uid} failed. Failed Updates: ${updates}`,
                err
              );
              // Add to failed batches
              failedBatches++;
              updates = 0;
            });
        })
      );

      // Log finish
      console.log(
        `All update batches on users_browse for ${uid} ran. Successful: ${successfullBatches}, Failed: ${failedBatches}`
      );
    } else {
      console.log(`No update batches on users_browses for ${uid}.`);
    }
  }

  validGenderField(key, value) {
    return this.genderData[key].indexOf(value) !== -1;
  }

  validateProfile(data) {
    let isValid = true;
    let basicProfileFields = Object.keys(this.basicProfile);

    // Handle the basics
    basicProfileFields.forEach(field => {
      if (
        !Object.prototype.hasOwnProperty.call(data, field) &&
        typeof data[field] !== "string" &&
        data[field] === ""
      ) {
        isValid = false;
        this.addRejection(`profile.${field}`, `Profile must have a ${field}.`);
      }
    });

    // Handle birthdate
    if (
      Object.prototype.hasOwnProperty.call(data, "birthdate") &&
      typeof data.birthdate === "string" &&
      data.birthdate !== ""
    ) {
      let birthdate = new moment(data.birthdate, "YYYY-MM-DD", true);
      if (birthdate.isValid() === false) {
        // Test valid date
        this.addRejection(
          "profile.birthdate",
          "Invalid date format.",
          "Should be YYYY-MM-DD"
        );
      } else {
        // Test age
        let end = new moment();
        let age = end.diff(birthdate, "years");
        if (age < 18) {
          this.addRejection(
            "profile.birthdate",
            "Must be 18 years of age or older."
          );
        }
      }
    } else {
      isValid = false;
      this.addRejection("profile.birthdate", "Profile must have a birthdate.");
    }

    // Handle gender
    if (
      Object.prototype.hasOwnProperty.call(data, "gender") &&
      typeof data.gender === "object"
    ) {
      let rejectedGenderUpdates = [];
      let genderFields = ["expression", "identity", "orientation", "pronoun"];

      // Cycle through genderFields
      genderFields.forEach(key => {
        if (data.gender[key] !== "") {
          let validGenderField = false;
          switch (key) {
            case "identity":
              validGenderField = this.validGenderField(
                "identities",
                data.gender[key]
              );
              break;
            default:
              validGenderField = this.validGenderField(
                `${key}s`,
                data.gender[key]
              );
              break;
          }
          if (validGenderField === false) {
            rejectedGenderUpdates.push(key);
          }
        }
      });

      // Cycle through data keys to see if they belong
      Object.keys(data.gender).forEach(key => {
        if (genderFields.indexOf(key) === -1) {
          rejectedGenderUpdates.push(key);
        }
      });

      if (rejectedGenderUpdates.length > 0) {
        isValid = false;
        this.addRejection(
          "profile.gender",
          `Could not validate gender fields ${rejectedGenderUpdates.join(
            ", "
          )}.`
        );
      }
    } else {
      isValid = false;
      this.addRejection(
        "profile.gender",
        "Profile must have a gender expression."
      );
    }

    // Validate location
    if (
      Object.prototype.hasOwnProperty.call(data, "location") &&
      typeof data.location === "object"
    ) {
      // Validate data
      if (
        (!Object.prototype.hasOwnProperty.call(data.location, "geo") &&
          typeof data.location.geo !== "object" &&
          Object.keys(data.location.geo).length <= 2) ||
        (!Object.prototype.hasOwnProperty.call(data.location, "hash") &&
          typeof data.location.hash !== "string") ||
        (!Object.prototype.hasOwnProperty.call(data.location, "text") &&
          typeof data.location.text !== "string")
      ) {
        isValid = false;
        this.addRejection(
          "profile.location",
          "Profile must have a valid location."
        );
      }

      // Cycle through data keys to see if they belong
      Object.keys(data.location).forEach(key => {
        if (["geo", "hash", "text"].indexOf(key) === -1) {
          isValid = false;
          this.addRejection(
            "profile.location",
            `Invalid ${key} field in location.`
          );
        }
      });
    } else {
      isValid = false;
      this.addRejection("profile.location", "Profile must have a location.");
    }

    // Cycle through data keys to see if they belong
    let acceptedKeys = [
      "avatars",
      "firstname",
      "lastname",
      "birthdate",
      "bio",
      "gender",
      "location"
    ];
    Object.keys(data).forEach(key => {
      if (acceptedKeys.indexOf(key) === -1) {
        isValid = false;
        this.addRejection(`profile.${key}`, `Invalid ${key} field.`);
      }
    });

    return isValid;
  }

  validateSeeking(data) {
    let isValid = true;

    // Handle maxDistance
    if (
      Object.prototype.hasOwnProperty.call(data, "maxDistance") &&
      typeof data.maxDistance === "number"
    ) {
      if (data.maxDistance < 0 || data.maxDistance > 200) {
        isValid = false;
        this.addRejection(
          "seeking.maxDistance",
          "Max distance must be a number and less than or equal to 200."
        );
      }
    } else {
      isValid = false;
      this.addRejection("seeking.maxDistance", "You must set a maxDistance.");
    }

    // Handle minScore
    if (
      Object.prototype.hasOwnProperty.call(data, "minScore") &&
      typeof data.minScore === "number"
    ) {
      if (data.minScore < 50 || data.minScore > 100) {
        isValid = false;
        this.addRejection(
          "seeking.minScore",
          "Minium score must be a number and between 50 and 100."
        );
      }
    } else {
      isValid = false;
      this.addRejection("seeking.minScore", "You must set a minimum score.");
    }

    // Handle relationships
    if (
      Object.prototype.hasOwnProperty.call(data, "relationships") &&
      typeof data.relationships === "object" &&
      Array.isArray(data.relationships) &&
      data.relationships.length > 0
    ) {
      // Get gender fields
      let genderFields = this.getGenderFields();

      // Setup rejected
      let rejectedRelationships = [];

      // Cycle through data.relationships
      data.relationships.forEach(relationship => {
        if (
          typeof relationship === "object" &&
          Object.prototype.hasOwnProperty.call(relationship, "type") &&
          Object.prototype.hasOwnProperty.call(relationship, "enabled") &&
          this.validRelationshipType(relationship.type) &&
          this.validRelationshipGenderFields(relationship)
        ) {
          // Setup relationshipType
          let relationshipType = this.getDefaultRelationshipType(
            relationship.type,
            {
              type: relationship.type,
              enabled: relationship.enabled
            }
          );

          // Process gender fields
          genderFields.forEach(key => {
            relationship[key].forEach(value => {
              if (this.validGenderField(key, value)) {
                relationshipType[key].push(value);
              }
            });
          });

          // Validate relationshipType
          if (relationshipType.enabled) {
            let allGenderFieldsHaveData = true;
            let badGenderFields = [];

            genderFields.forEach(field => {
              if (relationshipType[field].length === 0) {
                allGenderFieldsHaveData = false;
                badGenderFields.push(field);
              }
            });

            if (allGenderFieldsHaveData === false) {
              rejectedRelationships.push({
                type: relationship.type,
                fields: badGenderFields
              });
            }
          }
        } else {
          isValid = false;
          this.addRejection(
            "seeking.relationships",
            "Not a valid relationship object.",
            "Not all fields were present."
          );
        }
      });

      if (rejectedRelationships.length !== 0) {
        isValid = false;
        rejectedRelationships.forEach(relationship => {
          this.addRejection(
            `seeking.relationships.${relationship.type}`,
            `Invalid selections for relationship type: ${relationship.type}`,
            `Missing selections for ${relationship.fields.join(", ")}`
          );
        });
      }
    } else {
      isValid = false;
      this.addRejection(
        "seeking.relationships",
        "Not a valid relationship object."
      );
    }

    // Cycle through data keys to see if they belong
    let acceptedKeys = ["maxDistance", "minScore", "relationships"];
    Object.keys(data).forEach(key => {
      if (acceptedKeys.indexOf(key) === -1) {
        isValid = false;
        this.addRejection(`seeking.${key}`, `Invalid ${key} field..`);
      }
    });

    return isValid;
  }

  validateSettings(data) {
    let isValid = true;

    // Handle clearedQuestions
    if (
      !Object.prototype.hasOwnProperty.call(data, "clearedQuestions") &&
      typeof data.clearedQuestions !== "object" &&
      !Array.isArray(data.clearedQuestions)
    ) {
      isValid = false;
      this.addRejection(
        "settings.clearedQuestions",
        "There needs to be a clearedQuestions field."
      );
    }

    // Handle privacy
    if (
      Object.prototype.hasOwnProperty.call(data, "privacy") &&
      typeof data.privacy === "object"
    ) {
      // Preflight for data.privacy.profile.level
      if (
        !Object.prototype.hasOwnProperty.call(data.privacy, "profile") &&
        !Object.prototype.hasOwnProperty.call(data.privacy.profile, "level") &&
        typeof data.privacy.profile.level !== "number" &&
        (data.privacy.profile.level === 0 || data.privacy.profile.level > 3)
      ) {
        this.addRejection(
          "settings.privacy.profile.level",
          "Invalid profile privacy level",
          "Must be set to either Public, Authenticated, or SongMates."
        );
        return false;
      }

      let maxLevel = data.privacy.profile.level;

      // Validate data
      this.privacyFields.forEach(field => {
        if (typeof data.privacy[field] !== "object") {
          isValid = false;
          this.addRejection(`privacy.${field}`, "Invalid data.privacy.");
        } else {
          // Test display field
          if (
            Object.prototype.hasOwnProperty.call(data.privacy[field], "display")
          ) {
            if (typeof data.privacy[field].display !== "number") {
              isValid = false;
              this.addRejection(
                `settings.privacy.${field}.display`,
                "Invalid display value."
              );
            }
          }
          // Test level field
          if (
            Object.prototype.hasOwnProperty.call(data.privacy[field], "level")
          ) {
            if (
              typeof data.privacy[field].level !== "number" &&
              (data.privacy[field].level < 0 ||
                data.privacy[field].level > maxLevel)
            ) {
              isValid = false;
              this.addRejection(
                `settings.privacy.${field}.level`,
                "Invalid privacy level.",
                "Must be the same level or lower than Profile."
              );
            }
          } else {
            isValid = false;
            this.addRejection(
              `settings.privacy.${field}.level`,
              "Invalid privacy level.",
              "There must be a privacy level for this field."
            );
          }
        }
      });

      // Cycle through data keys to see if they belong
      Object.keys(data.privacy).forEach(key => {
        if (this.privacyFields.indexOf(key) === -1) {
          isValid = false;
          this.addRejection(
            "profile.privacy",
            `Invalid ${key} field in privacy settings.`
          );
        }
      });
    } else {
      isValid = false;
      this.addRejection(
        "settings.privacy",
        "There needs to be a privacy object."
      );
    }

    // Cycle through data keys to see if they belong
    let acceptedKeys = ["clearedQuestions", "privacy"];
    Object.keys(data).forEach(key => {
      if (acceptedKeys.indexOf(key) === -1) {
        isValid = false;
        this.addRejection(`settings.${key}`, `Invalid ${key} field.`);
      }
    });

    return isValid;
  }

  validateSetup(data) {
    let isValid = true;

    // Handle complete
    if (
      !Object.prototype.hasOwnProperty.call(data, "complete") &&
      typeof data.complete !== "boolean"
    ) {
      isValid = false;
      this.addRejection("setup.complete", "Not a valid value.");
    }

    // Handle completed
    if (
      !Object.prototype.hasOwnProperty.call(data, "completed") &&
      !typeof data.completed === "object" &&
      !Array.isArray(data.completed)
    ) {
      isValid = false;
      this.addRejection("setup.completed", "Not a valid value.");
    }

    // Handle next
    if (
      !Object.prototype.hasOwnProperty.call(data, "next") &&
      typeof data.next !== "string"
    ) {
      isValid = false;
      this.addRejection("setup.next", "Not a valid value.");
    }

    // Cycle through data keys to see if they belong
    let acceptedKeys = ["complete", "completed", "next"];
    Object.keys(data).forEach(key => {
      if (acceptedKeys.indexOf(key) === -1) {
        isValid = false;
        this.addRejection(`setup.${key}`, `Invalid ${key} field.`);
      }
    });

    return isValid;
  }

  validRelationshipType(value) {
    return this.relationshipTypes.indexOf(value) !== -1;
  }

  validRelationshipGenderFields(relationship) {
    let isValid = true;
    this.getGenderFields().every(field => {
      if (!Object.prototype.hasOwnProperty.call(relationship, field)) {
        isValid = false;
        return false;
      }
      return true;
    });
    return isValid;
  }
}

module.exports = new UserUpdate();
