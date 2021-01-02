import firebase, { db } from '../firebase';

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

// Firestoreからフォロー中のレーベル群を取得
export const getListOfFollowingLabelsFromFirestore = async (uid: string): Promise<string[]> => {
    try {
        const doc = await db.collection("users").doc(uid).get();
        const data = doc.data();
        if (!data) throw new Error(`${uid}のドキュメントにアクセスできません`);
        const labels: string[] = data.followingLabels || [];
        return labels;
    } catch (err) {
        console.log(err);
        return [];
    }
};

// Firestoreにフォロー中のレーベル群を格納
export const setListOfFollowingLabelsToFirestore = async (uid: string, newFollowing: string) => {
    try {
        await db.collection("users").doc(uid).update({
            followingLabels: firebase.firestore.FieldValue.arrayUnion(newFollowing),
        });
    } catch (err) {
        console.log(err);
    }
};