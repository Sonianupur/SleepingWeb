

const admin = require('firebase-admin');
const path = require('path');

// Point this to your service account JSON downloaded from Firebase console
const serviceAccount = require('./serviceAccountKey.json'); // <-- Change filename if needed

// Initialize app

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// CHANGE THESE:
const USER_UID = 'mRtqjHzonpfvKNgD94Ej4Teidyl2'; // e.g. 'q6KsD6mLRkYIt...'

async function setAdminRole() {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(USER_UID);

  await userRef.set(
    { role: 'admin' },
    { merge: true }
  );

  console.log(`✅ Set 'admin' role for user ${USER_UID}`);
  process.exit(0);
}

setAdminRole().catch(err => {
  console.error(err);
  process.exit(1);
});
