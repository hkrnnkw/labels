import firebase from 'firebase/app';
// eslint-disable-next-line
import 'firebase/functions';
// eslint-disable-next-line
import 'firebase/auth';
// eslint-disable-next-line
import 'firebase/firestore';

const config: Object = {
    'apiKey': process.env.REACT_APP_FIREBASE_API_KEY,
    'appId': process.env.REACT_APP_FIREBASE_APP_ID,
    'authDomain': process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    'databaseURL': process.env.REACT_APP_FIREBASE_DATABASE_URL,
    'measurementId': process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    'messagingSenderId': process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    'projectId': process.env.REACT_APP_FIREBASE_PROJECT_ID,
    'storageBucket': process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
};

const firebaseApp = !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
const f = firebaseApp.functions('asia-northeast1');
const auth = firebaseApp.auth();
const db = firebaseApp.firestore();

export { f, auth, db };
export default firebase;