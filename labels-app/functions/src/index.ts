import * as admin from 'firebase-admin';
import * as Spotify from './spotify';

admin.initializeApp();

const spotifyRedirect = Spotify.redirect;

export {
    spotifyRedirect,
};
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
