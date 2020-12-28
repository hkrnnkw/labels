import * as admin from 'firebase-admin';
import * as Spotify from './spotify';

admin.initializeApp({ projectId: "la-bels" });

// const spotify_updateClientCredentials = Spotify.updateClientCredentials;
const spotify_getAlbumsOfLabels = Spotify.getAlbumsOfLabels;
const spotify_redirect = Spotify.redirect;
const spotify_signIn = Spotify.signIn;
const spotify_refreshAccessToken = Spotify.refreshAccessToken;

export {
    // spotify_updateClientCredentials,
    spotify_getAlbumsOfLabels,
    spotify_redirect,
    spotify_signIn,
    spotify_refreshAccessToken,
};