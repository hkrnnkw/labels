import * as admin from 'firebase-admin';

// ユーザ管理
export const manageUser = async (spotifyRefreshToken: string, spotifyID: string, displayName: string,
    photoURL: string | null, email: string): Promise<string> => {
        
    // Spotifyのリフレッシュトークンを保存
    const databaseTask = admin.firestore().collection('users').doc(spotifyID).set({
        spotifyRefreshToken: spotifyRefreshToken,
        displayName: displayName,
        photoURL: photoURL,
        email: email,
    }, { merge: true });

    // アカウント更新／作成
    const userAccountTask = admin.auth().updateUser(spotifyID, {
        displayName: displayName,
        email: email,
    }).catch(error => {
        // ユーザが存在しない場合
        if (error.code === 'auth/user-not-found') {
            const followingLabels: string[] = [];
            admin.firestore().collection('users').doc(spotifyID).set({
                followingLabels: followingLabels,
            }, { merge: true }).catch(err => { throw err });

            // アカウント作成
            return admin.auth().createUser({
                uid: spotifyID,
                displayName: displayName,
                email: email,
            });
        }
        throw error;
    });

    await Promise.all([userAccountTask, databaseTask]);
    const customToken: string = await admin.auth().createCustomToken(spotifyID).catch(err => { throw err });
    console.log(`${spotifyID}のカスタムトークンを作成しました：${customToken}`);
    return customToken;
}