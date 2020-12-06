import * as admin from 'firebase-admin';

// ユーザ管理
export const manageUser = async (accessToken: string, spotifyID: string, displayName: string,
    photoURL: string | null, email: string): Promise<string> => {
        
    // Spotifyのアクセストークンを保存
    const databaseTask = admin.firestore().collection('users').doc(spotifyID).set({
        spotifyToken: accessToken,
        displayName: displayName,
        photoURL: photoURL,
        email: email,
    });

    // アカウント更新／作成
    const userAccountTask = admin.auth().updateUser(spotifyID, {
        displayName: displayName,
        email: email,
    }).catch((error) => {
        // ユーザが存在しなければ作成する
        if (error.code === 'auth/user-not-found') {
            return admin.auth().createUser({
                uid: spotifyID,
                displayName: displayName,
                email: email,
            });
        }
        throw error;
    });

    await Promise.all([userAccountTask, databaseTask]);
    const customToken: string = await admin.auth().createCustomToken(spotifyID)
        .catch(() => {
            return '';
        });
    console.log(`${spotifyID}のカスタムトークンを作成しました：${customToken}`);
    return customToken;
}