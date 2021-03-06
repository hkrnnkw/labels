import firebase, { f } from '../firebase';
import { Album, Artist, CustomAlbum, SimpleAlbum } from '../utils/interfaces';
import { Spotify, StrKeyObj, SearchQuery, SearchResult, Saved, Variant } from '../utils/types';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getSpotifyRefreshTokenFromFirestore } from './dbHandler';

interface newAccessTokenResponse extends firebase.functions.HttpsCallableResult {
    readonly data: Spotify;
}

interface SpotifyRedirectResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

// トークンを更新
export const refreshSpotifyToken = async (uid: string): Promise<Spotify> => {
    const refreshToken: string | null = await getSpotifyRefreshTokenFromFirestore(uid).catch(() => { return null });
    if (!refreshToken) throw new Error('リフレッシュトークンを取得できませんでした');

    const retrieveNewSpotifyObjUsingRefreshToken: firebase.functions.HttpsCallable = f.httpsCallable('spotifyRefreshAccessToken');
    const res: newAccessTokenResponse = await retrieveNewSpotifyObjUsingRefreshToken({ refreshToken: refreshToken });
    return res.data;
};

// CloudFunctions経由でauthorizeURLをリクエストし、そこへリダイレクト
export const signIn = async (): Promise<void> => {
    const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotifyRedirect');
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

// PUTリクエストを処理
const putReqProcessor = async (url: string, albumIds: string[], accessToken: string) => {
    await axios.put(url, {
        albumIds: albumIds,
    }, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

// DELETEリクエストを処理
const deleteReqProcessor = async (url: string, accessToken: string) => {
    await axios.delete(url, {
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

    const url = `https://api.spotify.com/v1/search?q=${options.join('%20')}&type=album&market=US&limit=20`;
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
    const idsSliced: string[][] = sliceArrayByNumber(artistIds, 50);
    const tasks = idsSliced.map(ids => {
        const url = `https://api.spotify.com/v1/artists?ids=${ids.join('%2C')}`;
        return getReqProcessor(url, accessToken);
    });
    const results = await Promise.all(tasks);
    const artists: Artist[] = results.flatMap(res => res.data.artists || []);
    return artists;
};

// アーティストのアルバムを取得
export const getArtistAlbums = async (artistId: string, accessToken: string): Promise<Album[]> => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums?market=US&limit=50`;
    const res = await getReqProcessor(url, accessToken);
    const simpleAlbums: SimpleAlbum[] = res.data.items;
    const albumIds: string[] = simpleAlbums.map(album => album.id);
    const idsSliced: string[][] = sliceArrayByNumber(albumIds, 20);
    const tasks = idsSliced.map(ids => getFullAlbumObj(ids, accessToken));
    const results: Album[][] = await Promise.all(tasks);
    return results.flat();
};

// アルバムがユーザライブラリに保存されているかチェック
const checkIsAlbumsInUserLibrary = async (albumIds: string[], accessToken: string): Promise<Saved[]> => {
    const idsSliced: string[][] = sliceArrayByNumber(albumIds, 50);
    const tasks = idsSliced.map(ids => {
        const url = `https://api.spotify.com/v1/me/albums/contains?ids=${ids.join('%2C')}`;
        return getReqProcessor(url, accessToken);
    });
    const axiosRes: AxiosResponse<boolean[]>[] = await Promise.all(tasks);
    const results: boolean[] = axiosRes.flatMap(res => res.data || []);
    return results.map((bool, i) => ({ albumId: albumIds[i], inLib: bool } as Saved));
};

// アルバムをユーザライブラリに保存
export const saveAlbumsToUserLibrary = async (albumIds: string[], accessToken: string) => {
    const idsSliced: string[][] = sliceArrayByNumber(albumIds, 50);
    const tasks = idsSliced.map(ids => {
        const url = `https://api.spotify.com/v1/me/albums?ids=${ids.join('%2C')}`;
        return putReqProcessor(url, albumIds, accessToken);
    });
    await Promise.all(tasks);
};

// アルバムをユーザライブラリから削除
export const removeAlbumsFromUserLibrary = async (albumIds: string[], accessToken: string) => {
    const idsSliced: string[][] = sliceArrayByNumber(albumIds, 50);
    const tasks = idsSliced.map(ids => {
        const url = `https://api.spotify.com/v1/me/albums?ids=${ids.join('%2C')}`;
        return deleteReqProcessor(url, accessToken);
    });
    await Promise.all(tasks);
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
const sliceArrayByNumber = (array: string[], num: number): string[][] => {
    if (array.length <= num) return [array];
    const length = Math.ceil(array.length / num);
    const results: string[][] = new Array(length);
    return results.fill([]).map((_: string[], i: number) => {
        return array.slice(i * num, (i + 1) * num);
    });
};

// various artistsかどうか判別
export const isVariousAritist = (artistName: string): boolean => {
    return artistName === 'ヴァリアス・アーティスト'
        || artistName.localeCompare('various artists', 'en', { sensitivity: 'base' }) === 0
        || artistName.localeCompare('v.a.', 'en', { sensitivity: 'base' }) === 0;
};

// CustomAlbumに整型
export const createCustomAlbum = async (albums: Album[], accessToken: string, isSaved = false): Promise<CustomAlbum[]> => {
    const ids: string[] = albums.map(album => album.id);
    const checked: Saved[] = isSaved ? ids.map(id => ({ albumId: id, inLib: true } as Saved))
        : await checkIsAlbumsInUserLibrary(ids, accessToken);
    const customAlbums: CustomAlbum[] = [];
    albums.forEach((album, i) => {
        const { label, copyright, release_date, albumType, artists, images, name, genres, tracks } = album;
        const variant: Variant = {
            saved: checked[i],
            labelName: label,
            copyright: copyright,
        };
        const pushedIndex: number =
            customAlbums.findIndex(ca => ca.name.localeCompare(name, 'en', { sensitivity: 'base' }) === 0);
        if (pushedIndex < 0) {
            customAlbums.push({
                albumType: albumType,
                artists: artists,
                images: images,
                name: name,
                genres: genres,
                release_date: release_date,
                tracks: tracks.items,
                variants: [variant],
            } as CustomAlbum);
        }
        else customAlbums[pushedIndex].variants.push(variant);
    });
    return customAlbums;
}