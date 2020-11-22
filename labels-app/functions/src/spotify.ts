import * as functions from 'firebase-functions';
import { createAccount } from './firebase';

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
            const email: string = res.body['email'];
            const img = res.body['images'][0];
            const profilePic: string | undefined = img ? img['url'] : undefined;
            return await createAccount(spotifyToken, spotifyUserID, userName, email, profilePic);
        })
        .catch((err: { message: any; }) => {
            console.log('不具合が発生 getMe：', err.message);
            return null;
        });
    return result;
});