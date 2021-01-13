import firebase, { db } from '../firebase';

// FirestoreからspotifyRefreshTokenを取得
export const getSpotifyRefreshTokenFromFirestore = async (uid: string): Promise<string> => {
    const doc = await db.collection("users").doc(uid).get();
    const data = doc.data();
    if (!data) throw new Error(`${uid}のドキュメントにアクセスできません`);
    const refreshToken: string = data.spotifyRefreshToken;
    return refreshToken;
};

// Firestoreからフォロー中のレーベル群を取得
export const getListOfFavLabelsFromFirestore = async (uid: string): Promise<{ [name: string]: number; }> => {
    const doc = await db.collection("users").doc(uid).get();
    const data = doc.data();
    if (!data) throw new Error(`${uid}のドキュメントにアクセスできません`);
    const favLabels: { [name: string]: number; } = data.favLabels;
    return favLabels;
};

// Firestoreにフォローしたレーベルを格納
export const addFavLabelToFirestore = async (uid: string, labelName: string): Promise<number> => {
    const now: number = new Date().getTime();
    await db.collection("users").doc(uid).set({
        favLabels: {
            [labelName]: now,
        },
    }, { merge: true });
    return now;
};

// Firestoreからフォローを外したレーベルを削除
export const deleteUnfavLabelFromFirestore = async (uid: string, labelName: string) => {
    await db.collection("users").doc(uid).set({
        favLabels: {
            [labelName]: firebase.firestore.FieldValue.delete(),
        },
    }, { merge: true });
};