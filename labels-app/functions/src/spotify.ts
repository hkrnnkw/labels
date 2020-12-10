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

type Album = {
    label: string;
    artists: Object[];
    id: string;
    images: Object[];
    name: string;
    releaseDate: string;
    genres: string[];
};

// ClientCredentialsFlowによりトークンをセットし、レーベルごとのアルバムデータを取得する
export const getAlbumsOfLabels = f.https.onCall(async (data, context) => {
    const spotifyApi = new SpotifyWebApi({
        clientId: clientId,
        clientSecret: clientSecret,
    });
    const labels = ['PAN', 'Warp Records', 'AD 93'];
    const today = new Date();
    const year = today.getFullYear();
    const limit = 20;
    try {
        const auth = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(auth.body['access_token']);

        // 各レーベルにおけるアルバム群の各idを取得
        const albumIdsOfLabels: string[][] = [];
        const response = await Promise.all(labels.map(async (label) => {
            return await spotifyApi.searchAlbums(`label:${label.includes(' ') ? `"${label}"` : label} year:${year} tag:new`, {limit: limit});
        }));
        response.forEach(res => {
            const albumIds: string[] = [];
            const items = res.body.albums.items;
            Object.keys(items).forEach(num => {
                const id = items[num].id;
                albumIds.push(id);
            });
            albumIdsOfLabels.push(albumIds);
        });

        // idを元にalbum object (full)を取得し、それを整型してから返す
        const result = await Promise.all(albumIdsOfLabels.map(async (albumId) => {
            const res = await spotifyApi.getAlbums(albumId);
            const rawArray: any[] = res.body.albums;
            const albums: Album[] = [];
            rawArray.forEach(elem => {
                if (!labels.includes(elem.label)) return;
                const album: Album = {
                    label: elem.label as string,
                    artists: elem.artists as Object[],
                    id: elem.id as string,
                    images: elem.images as Object[],
                    name: elem.name as string,
                    releaseDate: elem.releaseDate as string,
                    genres: elem.genres as string[],
                }
                albums.push(album);
            });
            return albums;
        }));
        return result;
    } catch (err) {
        console.log(err);
        return [];
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