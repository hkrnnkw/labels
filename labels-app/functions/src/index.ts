import * as admin from 'firebase-admin';
import * as Spotify from './spotify';

admin.initializeApp({ projectId: "la-bels" });

const spotifyRedirect = Spotify.redirect;
const spotifyToken = Spotify.token;

export {
    spotifyRedirect,
    spotifyToken,
};