import * as admin from 'firebase-admin';
import * as Spotify from './spotify';

admin.initializeApp();

const spotifyRedirect = Spotify.redirect;
const spotifyToken = Spotify.token;

export {
    spotifyRedirect,
    spotifyToken,
};