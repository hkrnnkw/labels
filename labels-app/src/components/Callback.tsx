import React, { FC, useEffect, useState } from 'react';
import { withRouter, useLocation } from 'react-router';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import firebase, { f, auth } from '../firebase';
import { StrKeyObj, Spotify } from '../utils/types';
import { Typography } from '@material-ui/core';
import { home, errorOccurred, userNotFound } from '../utils/paths';
import { setSpotifyTokens } from '../stores/user';

interface SpotifySignInResponse extends firebase.functions.HttpsCallableResult {
    readonly data: [string, Spotify];
}

const Callback: FC = () => {
    const [errorOccur, setErrorOccur] = useState(false);
    const [authed, setAuthed] = useState<boolean>();
    const location = useLocation();
    const dispatch = useDispatch();

    // CloudFunctions経由で、Spotifyのアクセストークン認証
    // その後、Firestoreにアカウントを作成、カスタムトークンを受領
    const requestFirestoreCustomToken = async (params: StrKeyObj): Promise<void> => {
        try {
            const spotifySignIn: firebase.functions.HttpsCallable = f.httpsCallable('spotify_signIn');
            const res: SpotifySignInResponse = await spotifySignIn(params);
            const customToken: string = res.data[0];
            if (!customToken.length) throw new Error('カスタムトークンを取得できませんでした');

            dispatch(setSpotifyTokens(res.data[1]));
            const credential: firebase.auth.UserCredential =
                await auth.signInWithCustomToken(customToken).catch(err => { throw err });
            setAuthed(credential.user !== null);
        } catch (err) {
            console.log(`ログインエラー：${err.message}`);
            setErrorOccur(true);
        }
    };

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

    useEffect(() => {
        const queryStr: string = location.search;
        const results: StrKeyObj = getParameters(queryStr);
        // TODO spotifyでの承認がされてるかチェック。trueなら、requestFirestoreCustomToken()
        requestFirestoreCustomToken(results).catch(err => console.log(err));
    }, []);

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
        errorOccur ? <Redirect to={errorOccurred} />
        :
        authed === undefined ? <Typography>ログイン中・・・</Typography>
        :
        <Redirect to={authed ? home : userNotFound} />
    )
};

export default withRouter(Callback);