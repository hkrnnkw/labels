import firebase, { f } from '../firebase';
import { Album, Artist, SimpleAlbum } from '../utils/interfaces';
import { Spotify, StrKeyObj } from '../utils/types';
import axios from 'axios';
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
    const response: SpotifyRedirectResponse = await spotifyRedirect(param);
    window.location.href = response.data;
}

// アルバムオブジェクト(Full)を取得
const getFullAlbumObj = async (albumIds: string[], accessToken: string): Promise<Album[]> => {
    const ids: string = albumIds.join();
    const url = `https://api.spotify.com/v1/albums?ids=${ids.replace(',', '%2C')}`;
    const res = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const albums: Album[] = res.data.albums;
    return albums;
};

// 各年のアルバムを取得
export const getAlbumsOfYear = async (label: string, years: number[], accessToken: string): Promise<Album[][]> => {
    const albumIdsArray = await Promise.all(years.map(async (year) => {
        const url = `https://api.spotify.com/v1/search?q=label%3A"${label}"%20year%3A${year}&type=album&limit=20`;
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const albums: SimpleAlbum[] = res.data.albums.items;
        return albums.map(album => album.id);
    }));

    return await Promise.all(albumIdsArray.map(async (albumIds) => {
        const albums: Album[] = await getFullAlbumObj(albumIds, accessToken);
        return albums.filter(album => label === album.label);
    }));
};

// Authorization code grantによりレーベル情報を取得
export const getAlbumsOfLabels = async (labels: string[], getNew: boolean, accessToken: string): Promise<Album[][]> => {
    const today = new Date();
    const year = today.getFullYear();
    const albumIdsArray = await Promise.all(labels.map(async (label) => {
        const url = `https://api.spotify.com/v1/search?q=label%3A"${label}"%20${getNew ? `tag%3Anew` : `year%3A${year}`}&type=album&limit=20`;
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const albums: SimpleAlbum[] = res.data.albums.items;
        return albums.map(album => album.id);
    }));
    const albumIdsFiltered = albumIdsArray.filter(album => album.length);

    const albumsArray = await Promise.all(albumIdsFiltered.map(async (albumIds) => {
        const albums: Album[] = await getFullAlbumObj(albumIds, accessToken);
        return albums.filter((elem: Album) => labels.includes(elem.label));
    }));
    return albumsArray.filter(album => album.length);
};

// ユーザライブラリに保存したアルバムを取得
export const getSavedAlbums = async (accessToken: string): Promise<Album[]> => {
    const response = await axios.get(`https://api.spotify.com/v1/me/albums?limit=20`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const items = response.data.items;
    return items.map((item: { album: Album; }) => item.album);
};

// アルバム検索
export const searchAlbums = async (keywords: string, accessToken: string): Promise<Album[]> => {
    const url = `https://api.spotify.com/v1/search?q=${keywords.replace(' ', '%20')}&type=album`;
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const albums: SimpleAlbum[] = response.data.albums.items;
    const albumIds: string[] = albums.map(album => album.id);
    return await getFullAlbumObj(albumIds, accessToken);
}

// アーティストの情報を取得
export const getArtists = async (artistIds: string[], accessToken: string): Promise<Artist[]> => {
    const ids: string = artistIds.join();
    const url = `https://api.spotify.com/v1/artists?ids=${ids.replace(',', '%2C')}`;
    const res = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const artists: Artist[] = res.data.artists;
    return artists;
}