import React, { FC, useEffect } from 'react';
import { withRouter, useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import firebase, { f, auth } from '../firebase';
import { StrKeyObj } from '../utils/types';
import { Typography } from '@material-ui/core';
import { UserState, setUserProfile } from '../stores/user';
import { errorOccurred, userNotFound } from '../utils/paths';

interface SpotifyTokenResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string | null;
}

const Callback: FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        const queryStr: string = window.location.search;
        const results: StrKeyObj = getParameters(queryStr);
        requestFirestoreCustomToken(results).catch(err => console.log(err));
    }, []);

    // クエリ文字列からパラメータを取得
    const getParameters = (queryStr: string): StrKeyObj => {
        const result: StrKeyObj = {};
        const temp = queryStr.substring(1);
        const rawParams: string[] = temp.split('&');
        for (let i = 0; i < rawParams.length; i++) {
            const elem: string[] = rawParams[i].split('=');
            const key: string = decodeURIComponent(elem[0]);
            const value: string = decodeURIComponent(elem[1]);
            result[key] = value;
        }
        return result;
    };

    // Firebaseログイン
    const signInWithCustomToken = async (customToken : string) => {
        try {
            const response: firebase.auth.UserCredential = await auth.signInWithCustomToken(customToken);
            const user = response.user;
            if (!user) {
                history.push(userNotFound);
                return;
            }
            const newState: UserState = {
                uid: user.uid,
                signedIn: true,
                refreshToken: user.refreshToken,
                displayName: user.displayName || user.uid,
                // TODO emailがnullなら、要求する？
                email: user.email || '',
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
            };
            dispatch(setUserProfile(newState));
            history.push('/');
        } catch (err) {
            console.log(`カスタムトークンによるログインでエラーが発生しました：${err.message}`);
            history.push(errorOccurred);
        }
    };

    // CloudFunctions経由で、Spotifyのアクセストークン認証
    // その後、Firestoreにアカウントを作成、カスタムトークンを受領
    const requestFirestoreCustomToken = async (params: StrKeyObj): Promise<void> => {
        const spotifyToken: firebase.functions.HttpsCallable = f.httpsCallable('spotifyToken');
        const res: SpotifyTokenResponse = await spotifyToken(params);
        const customToken: string | null = res.data;
        if (customToken && customToken.length) signInWithCustomToken(customToken).catch(err => console.log(err));
    };

    // TODO? https://qiita.com/zaburo/items/92920fa955bdb890c52e
    // const a = (refreshToken: string) => {
    //     const params = new URLSearchParams();
    //     params.append('grant_type', 'refresh_token');
    //     params.append('refresh_token', refreshToken);
    //     //リクエスト
    //     axios.post('https://securetoken.googleapis.com/v1/token?key=' + firebaseConfig.apiKey, params)
    //         .then(res => {
    //             // console.log(res.data.access_token);
    //             console.log(res);
    //         })
    //         .catch(e => {
    //             console.log(e);
    //         })
    // };

    return (
        <Typography>ログイン中・・・</Typography>
    )
};

export default withRouter(Callback);