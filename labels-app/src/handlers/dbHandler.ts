import firebase, { db } from '../firebase';
import { Label } from '../utils/types';

// FirestoreからspotifyRefreshTokenを取得
export const getSpotifyRefreshTokenFromFirestore = async (uid: string): Promise<string> => {
    const doc = await db.collection("users").doc(uid).get();
    const data = doc.data();
    if (!data) throw new Error(`${uid}のドキュメントにアクセスできません`);
    const refreshToken: string = data.spotifyRefreshToken;
    return refreshToken;
};

// Firestoreからフォロー中のレーベル群を取得
export const getListOfFavLabelsFromFirestore = async (uid: string): Promise<Label> => {
    const doc = await db.collection("users").doc(uid).get();
    const data = doc.data();
    if (!data) throw new Error(`${uid}のドキュメントにアクセスできません`);
    const favLabels: { name: string; date: number; }[] = data.favLabels;
    const labelObj: Label = {};
    for (const { name, date } of favLabels) labelObj[name] = { date: date, newReleases: [] };
    return labelObj;
};

// Firestoreにフォローしたレーベルを格納
export const addFavLabelToFirestore = async (uid: string, labelName: string): Promise<number> => {
    const now: number = new Date().getTime();
    await db.collection("users").doc(uid).update({
        favLabels: firebase.firestore.FieldValue.arrayUnion({ name: labelName, date: now }),
    });
    return now;
};

// Firestoreからフォローを外したレーベルを削除
export const deleteUnfavLabelFromFirestore = async (uid: string, labelName: string, date: number) => {
    await db.collection("users").doc(uid).update({
        favLabels: firebase.firestore.FieldValue.arrayRemove({ name: labelName, date: date }),
    });
};