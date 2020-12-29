import firebase, { f } from '../firebase';
import { Album, Artist } from '../utils/interfaces';
import { StrKeyObj } from '../utils/types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface newAccessTokenResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

interface GetAlbumsOfLabelsResponse extends firebase.functions.HttpsCallableResult {
    readonly data: Album[][];
}

interface SpotifyRedirectResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

const checkTokenExpired = async (token: string, refreshToken: string, expiration: string): Promise<string> => {
    const now = new Date();
    const expiresIn = new Date(Number(expiration));
    if (now < expiresIn) return token;
    const getAlbumsOfLabels: firebase.functions.HttpsCallable = f.httpsCallable('spotify_refreshAccessToken');
    const res: newAccessTokenResponse = await getAlbumsOfLabels({ refreshToken: refreshToken });
    return res.data;
};

// Client credentials flowによりレーベル情報を取得
export const getAlbumsOfLabelsWithCC = async (): Promise<Album[][]> => {
    const today = new Date();
    const year = today.getFullYear();
    const labels = [
        'PAN', 'Warp Records', 'XL Recordings', 'Stones Throw Records', 'Rough Trade', 'Ninja Tune', '4AD',
        'Brainfeeder', 'Dirty Hit', 'AD 93', 'Hyperdub', 'Jagjaguwar', 'Ghostly International', 'Dog Show Records',
        'Because Music', 'Text Records', 'Domino Recording Co', 'Perpetual Novice', 'EQT Recordings',
        'Republic Records', 'Smalltown Supersound', 'aritech',
    ];
    const getAlbumsOfLabels: firebase.functions.HttpsCallable = f.httpsCallable('spotify_getAlbumsOfLabels');
    const res: GetAlbumsOfLabelsResponse = await getAlbumsOfLabels({ labels: labels, year: year });
    return res.data;
};

// CloudFunctions経由でauthorizeURLをリクエストし、そこへリダイレクト
export const signIn = async (): Promise<void> => {
    const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotify_redirect');
    const param: StrKeyObj = { state: uuidv4() };
    const response: SpotifyRedirectResponse = await spotifyRedirect(param);
    window.location.href = response.data;
}

// Authorization code grantによりレーベル情報を取得
export const getAlbumsOfLabelsWithToken = async (accessToken: string, refreshToken: string, expiresIn: string): Promise<Album[][]> => {
    const today = new Date();
    const year = today.getFullYear();
    const token = await checkTokenExpired(accessToken, refreshToken, expiresIn);
    // TODO DBなどから取得（dbHandler.tsにて処理）
    const favLabels = [
        'Brainfeeder', 'Dirty Hit', 'AD 93', 'Hyperdub', 'Jagjaguwar', 'Ghostly International', 'Dog Show Records',
    ];
    const albumIdsArray = await Promise.all(favLabels.map(async (label) => {
        const url = `https://api.spotify.com/v1/search?q=label%3A"${label}"%20year%3A${year}&type=album&limit=20`;
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const albums: Album[] = res.data.albums.items;
        return albums.map(album => album.id);
    }));
    const albumIdsFiltered = albumIdsArray.filter(album => album.length);

    const albumsArray = await Promise.all(albumIdsFiltered.map(async (albumIds) => {
        const ids: string = albumIds.join();
        const url = `https://api.spotify.com/v1/albums?ids=${ids.replace(',', '%2C')}`;
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const albums: Album[] = res.data.albums.filter((elem: Album) => favLabels.includes(elem.label));
        return albums;
    }));
    return albumsArray.filter(album => album.length);
};

// ユーザライブラリに保存したアルバムを取得
export const getSavedAlbums = async (accessToken: string, refreshToken: string, expiresIn: string): Promise<Album[]> => {
    const token = await checkTokenExpired(accessToken, refreshToken, expiresIn);
    const response = await axios.get(`https://api.spotify.com/v1/me/albums?limit=20`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const items = response.data.items;
    return items.map((item: { album: Album; }) => item.album);
};

// アルバム検索
export const searchAlbums = async (keywords: string, accessToken: string, refreshToken: string, expiresIn: string): Promise<Album[]> => {
    const url = `https://api.spotify.com/v1/search?q=${keywords.replace(' ', '%20')}&type=album`;
    const token = await checkTokenExpired(accessToken, refreshToken, expiresIn);
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.albums.items;
}

// アーティストの情報を取得
export const getArtists = async (artistIds: string[], accessToken: string, refreshToken: string, expiresIn: string): Promise<Artist[]> => {
    const token = await checkTokenExpired(accessToken, refreshToken, expiresIn);
    const ids: string = artistIds.join();
    const url = `https://api.spotify.com/v1/artists?ids=${ids.replace(',', '%2C')}`;
    const res = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const artists: Artist[] = res.data.artists;
    return artists;
}