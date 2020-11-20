import * as functions from 'firebase-functions';

const f = functions.region('asia-northeast1');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
    clientId: functions.config().spotify.client_id,
    clientSecret: functions.config().spotify.client_secret,
    redirectUri: 'https://la-bels.web.app/callback',
});
const scopes = ['user-read-private', 'user-read-email'];

// ユーザの承認用URLを取得し、返す
export const redirect = f.https.onCall(async () => {
    const state = 'some-state-of-my-choice';
    const authorizeURL: string = await spotifyApi.createAuthorizeURL(scopes, state);
    return authorizeURL;
});