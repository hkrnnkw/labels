import firebase, { f } from '../firebase';

interface newAccessTokenResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

export const checkTokenExpired = async (token: string, refreshToken: string, expiration: string): Promise<string> => {
    const now = new Date();
    const expiresIn = new Date(Number(expiration));
    if (now < expiresIn) return token;
    const getAlbumsOfLabels: firebase.functions.HttpsCallable = f.httpsCallable('spotify_refreshAccessToken');
    const res: newAccessTokenResponse = await getAlbumsOfLabels({ refreshToken: refreshToken });
    return res.data;
};