import { db } from '../firebase';

// FirestoreからspotifyRefreshTokenを取得
export const takeOutSpotifyRefreshTokenFromFirestore = async (uid: string): Promise<string | null> => {
    try {
        const doc = await db.collection("users").doc(uid).get();
        const data = doc.data();
        // TODO DBルールを見直し、以下のコードの動作確認
        if (!data) return null;
        console.log(`データ：${data}`);
        const refreshToken: string = data.spotifyRefreshToken;
        return refreshToken;
    } catch (err) {
        console.log(err);
        return null;
    }
};