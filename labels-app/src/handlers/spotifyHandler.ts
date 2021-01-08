import firebase, { f } from '../firebase';
import { Album, Artist, SimpleAlbum } from '../utils/interfaces';
import { Spotify, StrKeyObj, SearchQuery, SearchResult } from '../utils/types';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getSpotifyRefreshTokenFromFirestore } from './dbHandler';

interface newAccessTokenResponse extends firebase.functions.HttpsCallableResult {
    readonly data: Spotify;
}

interface SpotifyRedirectResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

// トークンの有効期限を確認
export const checkTokenExpired = async (obj: Spotify, uid: string): Promise<string | Spotify> => {
    const { token, refreshToken, expiresIn } = obj.spotify;
    const now = new Date();
    if (now < new Date(expiresIn)) return token;

    const refresh: string | null = refreshToken.length ? refreshToken :
        await getSpotifyRefreshTokenFromFirestore(uid).catch(() => { return null });
    if (!refresh) throw new Error('リフレッシュトークンを取得できませんでした');

    const refreshAccessToken: firebase.functions.HttpsCallable = f.httpsCallable('spotify_refreshAccessToken');
    const res: newAccessTokenResponse = await refreshAccessToken({ refreshToken: refresh });
    return res.data;
};

// CloudFunctions経由でauthorizeURLをリクエストし、そこへリダイレクト
export const signIn = async (): Promise<void> => {
    const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotify_redirect');
    const param: StrKeyObj = { state: uuidv4() };
    const res: SpotifyRedirectResponse = await spotifyRedirect(param);
    window.location.href = res.data;
};

// GETリクエストを処理
const getReqProcessor = async (url: string, accessToken: string): Promise<AxiosResponse> => {
    return await axios.get(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

// アルバムオブジェクト(Full)を取得
const getFullAlbumObj = async (albumIds: string[], accessToken: string): Promise<Album[]> => {
    const ids: string = albumIds.join();
    const url = `https://api.spotify.com/v1/albums?ids=${ids.replace(',', '%2C')}`;
    const res = await getReqProcessor(url, accessToken);
    const albums: Album[] = res.data.albums;
    return albums;
};

// アルバム検索
export const searchAlbums = async (query: SearchQuery, accessToken: string): Promise<SearchResult> => {
    const { getNew, year, genre, label, keywords } = query;

    const options: string[] = [];
    if (getNew === true) options.push(`tag%3Anew`);
    if (year) options.push(`year%3A${year}`);
    if (genre) options.push(`genre%3A"${genre}"`);
    if (label) options.push(`label%3A"${label}"`);
    const queryStr: string = options.join('%20');
    options.length = 0;
    if (queryStr.length) options.push(queryStr);
    if (keywords) options.push(keywords.replace(' ', '%20'));
    if (!options.length) return { query: query, results: [] };

    const url = `https://api.spotify.com/v1/search?q=${options.join('%20')}&type=album&limit=20`;
    const res = await getReqProcessor(url, accessToken);
    const simpleAlbums: SimpleAlbum[] = res.data.albums.items;
    if (!simpleAlbums.length) return { query: query, results: [] };
    const albumIds: string[] = simpleAlbums.map(album => album.id);

    const albums: Album[] = await getFullAlbumObj(albumIds, accessToken);
    const result: SearchResult = {
        query: query,
        results: label ? albums.filter(album => label === album.label) : albums,
    };
    return result;
};

// ユーザライブラリに保存したアルバムを取得
export const getSavedAlbums = async (accessToken: string): Promise<Album[]> => {
    const url = `https://api.spotify.com/v1/me/albums?limit=20`;
    const res = await getReqProcessor(url, accessToken);
    const items = res.data.items;
    return items.map((item: { album: Album; }) => item.album);
};

// アーティストの情報を取得
export const getArtists = async (artistIds: string[], accessToken: string): Promise<Artist[]> => {
    const ids: string = artistIds.join();
    const url = `https://api.spotify.com/v1/artists?ids=${ids.replace(',', '%2C')}`;
    const res = await getReqProcessor(url, accessToken);
    const artists: Artist[] = res.data.artists;
    return artists;
};

// アーティストのアルバムを取得
export const getArtistAlbums = async (artistId: string, accessToken: string): Promise<Album[]> => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums`;
    const res = await getReqProcessor(url, accessToken);
    const simpleAlbums: SimpleAlbum[] = res.data.items;
    const albumIds: string[] = simpleAlbums.map(album => album.id);
    return await getFullAlbumObj(albumIds, accessToken);
};