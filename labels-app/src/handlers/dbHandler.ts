import { db } from '../firebase';

// FirestoreからspotifyRefreshTokenを取得
export const getSpotifyRefreshTokenFromFirestore = async (uid: string): Promise<string | null> => {
    try {
        const doc = await db.collection("users").doc(uid).get();
        const data = doc.data();
        if (!data) return null;
        const refreshToken: string = data.spotifyRefreshToken;
        return refreshToken;
    } catch (err) {
        console.log(err);
        return null;
    }
};