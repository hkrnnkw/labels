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
const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
});

interface Album {
    album_type: string;
    artists: Object[];
    copyright: Object;
    genres: string[];
    id: string;
    images: Object[];
    label: string;
    name: string;
    release_date: string;
    tracks: Object;
};

// ClientCredentialsFlowによりトークンをセットし、レーベルごとのアルバムデータを取得する
export const getAlbumsOfLabels = f.https.onCall(async (data, context) => {
    const labels: string[] = data.labels;
    const year: number = data.year;
    const limit = 20;
    try {
        const auth = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(auth.body['access_token']);

        // 各レーベルにおけるアルバム群の各idを取得
        const fetchAlbumIdsOfLabels = async (labelList: string[]): Promise<string[][]> => {
            const response = await Promise.all(labelList.map(async (label) => {
                return await spotifyApi.searchAlbums(`label:"${label}" year:${year}`, { limit: limit });
            }));
            return response.map(res => {
                const albums: Album[] = res.body.albums.items;
                return albums.map(album => album.id);
            });
        };

        // idを元にalbum object (full)を取得し、それを整型してから返す
        const fetchAlbumsOfLabels = async (albumIds: string[][], labelList: string[]): Promise<Album[][]> => {
            const response = await Promise.all(albumIds.map(async (albumId) => {
                return await spotifyApi.getAlbums(albumId);
            }));
            return response.map(res => {
                const albums: Album[] = res.body.albums.filter((elem: Album) => labelList.includes(elem.label));
                return albums;
            });
        }

        const albumIdsOfLabels: string[][] = await fetchAlbumIdsOfLabels(labels);
        const albumsOfLabels: Album[][] = await fetchAlbumsOfLabels(albumIdsOfLabels, labels);
        return albumsOfLabels.filter((elem: Album[]) => elem.length);
    } catch (err) {
        console.log(err);
        return [];
    }
});

// ユーザの承認用URLを取得し、返す
export const redirect = f.https.onCall((data, context) => {
    const scopes = ['user-read-private', 'user-read-email', 'user-top-read', 'user-read-recently-played',
        'streaming', 'playlist-modify-public', 'user-library-read', 'user-library-modify'];
    const state: string = data.state;
    const authorizeURL: string = spotifyApi.createAuthorizeURL(scopes, state);
    return authorizeURL;
});

// アクセストークンを取得（正常に処理されたら、Firestoreにアカウントを作成）
export const signIn = f.https.onCall(async (data, context) => {
    try {
        const response: { body: { [x: string]: any; } } = await spotifyApi.authorizationCodeGrant(data.code)
        const token: string = response.body['access_token'];
        const refreshToken: string = response.body['refresh_token'];
        spotifyApi.setAccessToken(token);
        spotifyApi.setRefreshToken(refreshToken);
        const date = new Date();
        const expiresIn = date.setMinutes(date.getMinutes() + 58);
        const user: { body: { [x: string]: any; } } = await spotifyApi.getMe();
        const spotifyUserID: string = user.body['id'];
        const userName: string = user.body['display_name'];
        const img = user.body['images'][0];
        const profilePic: string | null = img ? img['url'] : null;
        const email: string = user.body['email'];
        const customToken: string = await manageUser(refreshToken, spotifyUserID, userName, profilePic, email);
        return {
            token: token,
            expiresIn: expiresIn.toString(),
            refreshToken: refreshToken,
            customToken: customToken,
        }
    } catch (err) {
        console.log(`不具合が発生：${err.message}`);
        return {};
    };
});

// この呼び出しの前にspotifyApiへ clientId, clientSecret, refreshToken が設定されている必要があります
export const refreshAccessToken = f.https.onCall(async (data, context) => {
    try {
        spotifyApi.setRefreshToken(data.refreshToken);
        const response = await spotifyApi.refreshAccessToken();
        const spotifyToken: string = response.body['access_token'];
        spotifyApi.setAccessToken(spotifyToken);
        console.log(`アクセストークンを更新しました：${spotifyToken}`);
        return spotifyToken;
    } catch (err) {
        console.log('アクセストークンを更新できませんでした ', err);
        return '';
    }
});