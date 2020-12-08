import * as admin from 'firebase-admin';
import * as Spotify from './spotify';

admin.initializeApp({ projectId: "la-bels" });

const spotify_getAlbumsOfLabels = Spotify.getAlbumsOfLabels;
const spotifyRedirect = Spotify.redirect;
const spotifyToken = Spotify.token;

export {
    spotify_getAlbumsOfLabels,
    spotifyRedirect,
    spotifyToken,
};