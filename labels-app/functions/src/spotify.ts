import * as functions from 'firebase-functions';
import { manageUser } from './firestore';

const f = functions.region('asia-northeast1');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
    // clientId: functions.config().spotify.client_id,
    // clientSecret: functions.config().spotify.client_secret,
    // redirectUri: 'https://la-bels.web.app/callback',
    clientId: 'd3047cbde8024e9f8ea04e0205be4a7c',
    clientSecret: '319ba476889548c89f4ed26f094a303a',
    redirectUri: 'http://localhost:5000/callback',
});
const scopes = ['user-read-private', 'user-read-email'];

// ユーザの承認用URLを取得し、返す
export const redirect = f.https.onCall((data, context) => {
    const state: string = data.state;
    const authorizeURL: string = spotifyApi.createAuthorizeURL(scopes, state);
    return authorizeURL;
});

// アクセストークンを取得（正常に処理されたら、Firestoreにアカウントを作成）
export const token = f.https.onCall(async (data, context) => {
    let spotifyToken: string;
    await spotifyApi.authorizationCodeGrant(data.code)
        .then((res: { body: { [x: string]: any; }; }) => {
            spotifyToken = res.body['access_token'];
            spotifyApi.setAccessToken(spotifyToken);
        })
        .catch((err: { message: any; }) => {
            console.log('不具合が発生 authorizationCodeGrant：', err.message);
        });
    const result: string | null = spotifyApi.getMe()
        .then(async (res: { body: { [x: string]: any; }; }) => {
            const spotifyUserID: string = res.body['id'];
            const userName: string = res.body['display_name'];
            const img = res.body['images'][0];
            const profilePic: string | null = img ? img['url'] : null;
            const email: string = res.body['email'];
            return await manageUser(spotifyToken, spotifyUserID, userName, profilePic, email);
        })
        .catch((err: { message: any; }) => {
            console.log('不具合が発生 getMe：', err.message);
            return null;
        });
    return result;
});