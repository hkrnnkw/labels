import firebase, { db } from '../firebase';
import { Label } from '../utils/types';

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
export const getListOfFavLabelsFromFirestore = async (uid: string): Promise<Label> => {
    try {
        const doc = await db.collection("users").doc(uid).get();
        const data = doc.data();
        if (!data) throw new Error(`${uid}のドキュメントにアクセスできません`);
        const favLabels: { name: string; date: number; }[] = data.favLabels;
        const labelObj: Label = {};
        for (const { name, date } of favLabels) labelObj[name] = { date: date, newReleases: [] };
        return labelObj;
    } catch (err) {
        console.log(err);
        return {};
    }
};

// Firestoreにフォローしたレーベルを格納
export const addFavLabelToFirestore = async (uid: string, labelName: string): Promise<number> => {
    try {
        const now: number = new Date().getTime();
        await db.collection("users").doc(uid).update({
            favLabels: firebase.firestore.FieldValue.arrayUnion({ name: labelName, date: now }),
        });
        return now;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Firestoreからフォローを外したレーベルを削除
export const deleteUnfavLabelFromFirestore = async (uid: string, labelName: string, date: number) => {
    try {
        await db.collection("users").doc(uid).update({
            favLabels: firebase.firestore.FieldValue.arrayRemove({ name: labelName, date: date }),
        });
    } catch (err) {
        console.log(err);
    }
};