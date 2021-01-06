import firebase, { db } from '../firebase';
import { FavLabel } from '../utils/types';

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
export const getListOfFavLabelsFromFirestore = async (uid: string): Promise<FavLabel[]> => {
    try {
        const doc = await db.collection("users").doc(uid).get();
        const data = doc.data();
        if (!data) throw new Error(`${uid}のドキュメントにアクセスできません`);
        const labels: FavLabel[] = data.favLabels || [];
        return labels;
    } catch (err) {
        console.log(err);
        return [];
    }
};

// Firestoreにフォローしたレーベルを格納
export const addFavLabelToFirestore = async (uid: string, labelName: string): Promise<FavLabel> => {
    try {
        const favLabel: FavLabel = {
            labelName: labelName,
            date: new Date(),
        };
        await db.collection("users").doc(uid).update({
            favLabels: firebase.firestore.FieldValue.arrayUnion(favLabel),
        });
        return favLabel;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// Firestoreからフォローを外したレーベルを削除
export const deleteUnfavLabelFromFirestore = async (uid: string, favLabel: FavLabel) => {
    try {
        await db.collection("users").doc(uid).update({
            favLabels: firebase.firestore.FieldValue.arrayRemove(favLabel),
        });
    } catch (err) {
        console.log(err);
    }
};