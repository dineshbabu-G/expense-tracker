const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");

const serviceAccountPath = path.resolve(
  __dirname,
  "..",
  "firebase-service-account.json"
);

const serviceAccount = require(
  serviceAccountPath
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

module.exports = auth;