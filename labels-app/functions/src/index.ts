import * as admin from 'firebase-admin';
import * as Spotify from './spotify';

admin.initializeApp({ projectId: 'la-bels' });

// const spotifyUpdateClientCredentials = Spotify.updateClientCredentials;
// const spotifyGetAlbumsOfLabels = Spotify.getAlbumsOfLabels;
const spotifyRedirect = Spotify.redirect;
const spotifySignIn = Spotify.signIn;
const spotifyRefreshAccessToken = Spotify.refreshAccessToken;

export {
    // spotifyUpdateClientCredentials,
    // spotifyGetAlbumsOfLabels,
    spotifyRedirect,
    spotifySignIn,
    spotifyRefreshAccessToken,
};