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
    const { token, expiresIn } = obj.spotify;
    const now = new Date();
    if (now < new Date(expiresIn)) return token;

    const refreshToken: string | null = await getSpotifyRefreshTokenFromFirestore(uid).catch(() => { return null });
    if (!refreshToken) throw new Error('リフレッシュトークンを取得できませんでした');

    const refreshAccessToken: firebase.functions.HttpsCallable = f.httpsCallable('spotify_refreshAccessToken');
    const res: newAccessTokenResponse = await refreshAccessToken({ refreshToken: refreshToken });
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
    const ids: string = albumIds.join('%2C');
    const url = `https://api.spotify.com/v1/albums?ids=${ids}`;
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
    if (!options.length) return { query: query, albums: [] };

    const url = `https://api.spotify.com/v1/search?q=${options.join('%20')}&type=album&limit=20`;
    const res = await getReqProcessor(url, accessToken);
    const simpleAlbums: SimpleAlbum[] = res.data.albums.items;
    if (!simpleAlbums.length) return { query: query, albums: [] };
    const albumIds: string[] = simpleAlbums.flatMap(album => [album.id] || []);

    const albums: Album[] = await getFullAlbumObj(albumIds, accessToken);
    const result: SearchResult = {
        query: query,
        albums: label ? albums.filter(album => label === album.label) : albums,
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
    const ids: string = artistIds.join('%2C');
    const url = `https://api.spotify.com/v1/artists?ids=${ids}`;
    const res = await getReqProcessor(url, accessToken);
    const artists: Artist[] = res.data.artists;
    return artists;
};

// アーティストのアルバムを取得
export const getArtistAlbums = async (artistId: string, accessToken: string): Promise<Album[]> => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums?market=US&limit=50`;
    const res = await getReqProcessor(url, accessToken);
    const simpleAlbums: SimpleAlbum[] = res.data.items;
    const albumIds: string[] = simpleAlbums.map(album => album.id);
    if (albumIds.length < 20) {
        return await getFullAlbumObj(albumIds, accessToken);
    }
    const idsSliced: string[][] = sliceArrayByNumber(albumIds, 20);
    const tasks = idsSliced.map(ids => getFullAlbumObj(ids, accessToken));
    const results: Album[][] = await Promise.all(tasks);
    return results.flat();
};

// release_dateをYYYY-MM-DD形式から変換
export const convertReleaseDate = (rawDate: string): string => {
    const rawArray: string[] = rawDate.split('-');
    const year: string = rawArray[0];
    if (rawArray.length === 1) return year;
    const day: string = rawArray[2].startsWith('0') ? rawArray[2].slice(1) : rawArray[2];
    const converted: string[] = [day, ', ', year];
    switch (rawArray[1]) {
        case '01':
            converted.unshift('January ');
            break;
        case '02':
            converted.unshift('February ');
            break;
        case '03':
            converted.unshift('March ');
            break;
        case '04':
            converted.unshift('April ');
            break;
        case '05':
            converted.unshift('May ');
            break;
        case '06':
            converted.unshift('June ');
            break;
        case '07':
            converted.unshift('July ');
            break;
        case '08':
            converted.unshift('August ');
            break;
        case '09':
            converted.unshift('September ');
            break;
        case '10':
            converted.unshift('October ');
            break;
        case '11':
            converted.unshift('November ');
            break;
        case '12':
            converted.unshift('December ');
            break;
    }
    return converted.join('');
};

// 指定した要素数で配列を分割
export const sliceArrayByNumber = (array: string[], num: number): string[][] => {
    const length = Math.ceil(array.length / num);
    const results: string[][] = new Array(length);
    return results.fill([]).map((_: string[], i: number) => {
        return array.slice(i * num, (i + 1) * num);
    });
};

export const isVariousAritist = (artistName: string): boolean => {
    return artistName === 'ヴァリアス・アーティスト'
        || artistName.localeCompare('various artists', 'en', { sensitivity: 'base' }) === 0
        || artistName.localeCompare('v.a.', 'en', { sensitivity: 'base' }) === 0;
};