import * as functions from 'firebase-functions';
import { manageUser } from './firestore';

const f = functions.region('asia-northeast1');
const SpotifyWebApi = require('spotify-web-api-node');
// const clientId = functions.config().spotify.client_id;
// const clientSecret = functions.config().spotify.client_secret;
// const redirectUri = 'https://la-bels.web.app/callback';
const clientId = 'd3047cbde8024e9f8ea04e0205be4a7c';
const clientSecret = '319ba476889548c89f4ed26f094a303a';
const redirectUri = 'http://localhost:5000/callback';

// ClientCredentialsFlowによりアクセストークンを取得し、セットする
const processTokenByClientCredentials = async () => {
    const spotifyApi = new SpotifyWebApi({
        clientId: clientId,
        clientSecret: clientSecret,
    });
    try {
        const response = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(response.body['access_token']);
    } catch (err) {
        console.log('Something went wrong when retrieving an access token', err);
    }
};

// レーベルごとのアルバムデータを取得する
export const getAlbumsOfLabels = f.https.onCall(async (data, context) => {
    try {
        await processTokenByClientCredentials();
    } catch (err) {
        console.log(err);
    }
});

// ユーザの承認用URLを取得し、返す
export const redirect = f.https.onCall((data, context) => {
    const spotifyApi = new SpotifyWebApi({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
    });
    const scopes = ['user-read-private', 'user-read-email'];
    const state: string = data.state;
    const authorizeURL: string = spotifyApi.createAuthorizeURL(scopes, state);
    return authorizeURL;
});

// アクセストークンを取得（正常に処理されたら、Firestoreにアカウントを作成）
export const token = f.https.onCall(async (data, context) => {
    const spotifyApi = new SpotifyWebApi({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
    });
    try {
        const response: { body: { [x: string]: any; } } = await spotifyApi.authorizationCodeGrant(data.code)
        const spotifyToken: string = response.body['access_token'];
        spotifyApi.setAccessToken(spotifyToken);
        const user: { body: { [x: string]: any; } } = await spotifyApi.getMe();
        const spotifyUserID: string = user.body['id'];
        const userName: string = user.body['display_name'];
        const img = user.body['images'][0];
        const profilePic: string | null = img ? img['url'] : null;
        const email: string = user.body['email'];
        const customToken: string = await manageUser(spotifyToken, spotifyUserID, userName, profilePic, email);
        return {
            spotifyToken: spotifyToken,
            customToken: customToken,
        }
    } catch (err) {
        console.log(`不具合が発生：${err.message}`);
        return {};
    };
});