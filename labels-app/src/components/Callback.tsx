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
    const dispatch = useDispatch();
    const location = useLocation();
    const [path, setPath] = useState<string>();

    useEffect(() => {
        // クエリ文字列からパラメータを取得
        const getParams = (queryStr: string): StrKeyObj => {
            const obj: StrKeyObj = {};
            const temp = queryStr.substring(1);
            const rawParams: string[] = temp.split('&');
            for (const rawParam of rawParams) {
                const elem: string[] = rawParam.split('=');
                const key: string = decodeURIComponent(elem[0]);
                const value: string = decodeURIComponent(elem[1]);
                obj[key] = value;
            }
            return obj;
        };

        // Spotify認証のあと、Firebase認証
        const requestFirestoreCustomToken = async (params: StrKeyObj): Promise<firebase.User | null> => {
            // CloudFunctions経由で、AuthorizationCodeFlow
            const spotifySignIn: firebase.functions.HttpsCallable = f.httpsCallable('spotify_signIn');
            const res: SpotifySignInResponse = await spotifySignIn(params);
            
            const [customToken, spotifyTokens] = res.data;
            if (!customToken.length) throw new Error('カスタムトークンを取得できませんでした');
            dispatch(setSpotifyTokens(spotifyTokens));

            // Firestoreにアカウントを作成、カスタムトークンを使って認証
            const credential: firebase.auth.UserCredential = await auth.signInWithCustomToken(customToken);
            return credential.user;
        };

        const results: StrKeyObj = getParams(location.search);
        if (results['error'] && results['error'] === 'access_denied') {
            setPath(home);
            return;
        }
        
        requestFirestoreCustomToken(results)
            .then(user => setPath(user ? home : userNotFound))
            .catch(err => {
                console.log(`ログインエラー：${err}`);
                setPath(errorOccurred);
            });
    }, [location.search, dispatch]);

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

    return path ? <Redirect to={path} /> : <Typography>ログイン中・・・</Typography>;
};

export default withRouter(Callback);