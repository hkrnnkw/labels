import * as functions from 'firebase-functions';
import { manageUser } from './firestore';
import SpotifyWebApi = require('spotify-web-api-node');

const f = functions.region('asia-northeast1');
const clientId = functions.config().spotify.client_id;
const clientSecret = functions.config().spotify.client_secret;
const redirectUri = 'https://la-bels.web.app/callback';
const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
});

// ClientCredentialsを1時間ごとに更新
export const updateClientCredentials = f.pubsub.schedule('every 60 minutes').onRun(async (context) => {
    console.log(`timestamp: ${context.timestamp}`);
    try {
        const auth = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(auth.body['access_token']);
    } catch (err) {
        console.error(err);
    }
});

// ClientCredentialsFlowによりトークンをセットし、レーベルごとのアルバムデータを取得する
export const getAlbumsOfLabels = f.https.onCall(async (data, context) => {
    console.log(`appId: ${context.app?.appId}`);
    const auth = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(auth.body['access_token']);
    const labels: string[] = data.labels;
    const year: number = data.year;
    const limit = 20;

    // 各レーベルにおけるアルバム群の各idを取得
    const fetchAlbumIdsOfLabels = async (labelList: string[]): Promise<string[][]> => {
        const response = await Promise.all(labelList.map(async (label) => {
            return await spotifyApi.searchAlbums(`label:"${label}" year:${year}`, { limit: limit });
        }));
        return response.map(res => {
            const pagingObject: SpotifyApi.PagingObject<SpotifyApi.AlbumObjectSimplified> | undefined = res.body.albums;
            const albums: SpotifyApi.AlbumObjectSimplified[] = pagingObject?.items || [];
            return albums.map(album => album.id);
        });
    };

    // idを元にalbum object (full)を取得し、それを整型してから返す
    const fetchAlbumsOfLabels = async (albumIds: string[][], labelList: string[]): Promise<SpotifyApi.AlbumObjectFull[][]> => {
        const response = await Promise.all(
            albumIds.map(async (albumId) => await spotifyApi.getAlbums(albumId))
        );
        return response.map(res => res.body.albums.filter(elem => labelList.includes(elem.label)));
    }

    try {
        const albumIdsOfLabels: string[][] = await fetchAlbumIdsOfLabels(labels);
        const albumsOfLabels: SpotifyApi.AlbumObjectFull[][] = await fetchAlbumsOfLabels(albumIdsOfLabels, labels);
        return albumsOfLabels.filter((elem: SpotifyApi.AlbumObjectFull[]) => elem.length);
    } catch (err) {
        console.error(err);
        return [];
    }
});

// ユーザの承認用URLを取得し、返す
export const redirect = f.https.onCall((data, context) => {
    console.log(`uid: ${context.auth?.uid}`);
    const scopes = ['user-read-private', 'user-read-email', 'user-top-read', 'user-read-recently-played',
        'streaming', 'playlist-modify-public', 'user-library-read', 'user-library-modify'];
    const state: string = data.state;
    const authorizeURL: string = spotifyApi.createAuthorizeURL(scopes, state);
    return authorizeURL;
});

// アクセストークンを取得（正常に処理されたら、Firestoreにアカウントを作成）
export const signIn = f.https.onCall(async (data, context) => {
    console.log(`uid: ${context.auth?.uid}`);
    try {
        const response = await spotifyApi.authorizationCodeGrant(data.code);
        const spotifyToken: string = response.body['access_token'];
        const refreshToken: string = response.body['refresh_token'];
        spotifyApi.setAccessToken(spotifyToken);
        spotifyApi.setRefreshToken(refreshToken);
        const date = new Date();
        const expiresIn = date.setMinutes(date.getMinutes() + 58);
        const user = await spotifyApi.getMe();
        const spotifyUserID: string = user.body['id'];
        const userName = user.body['display_name'] || null;
        const imgs: SpotifyApi.ImageObject[] | undefined = user.body['images'];
        const profilePic: string | null = imgs ? imgs[0]['url'] : null;
        const email: string = user.body['email'];
        const customToken: string = await manageUser(refreshToken, spotifyUserID, userName, profilePic, email);
        return [customToken, {
            token: spotifyToken,
            exp: expiresIn,
        }];
    } catch (err) {
        console.error(err);
        return ['', {}];
    };
});

// この呼び出しの前にspotifyApiへ clientId, clientSecret, refreshToken が設定されている必要があります
export const refreshAccessToken = f.https.onCall(async (data, context) => {
    try {
        spotifyApi.setRefreshToken(data.refreshToken);
        const response = await spotifyApi.refreshAccessToken();
        const spotifyToken: string = response.body['access_token'];
        spotifyApi.setAccessToken(spotifyToken);
        const date = new Date();
        const expiresIn = date.setMinutes(date.getMinutes() + 58);
        console.log(`uid: ${context.auth?.uid}, spotifyToken was refreshed: ${spotifyToken}`);
        return {
            token: spotifyToken,
            exp: expiresIn,
        };
    } catch (err) {
        console.error(`uid: ${context.auth?.uid}, ${err}`);
        return {};
    }
});