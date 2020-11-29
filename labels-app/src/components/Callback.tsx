import React, { FC, useState, useEffect } from 'react';
import { withRouter, useHistory } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import firebase, { f, auth } from '../firebase';
import { RootState } from '../stores/index';
import { StrKeyObj } from '../utils/types';
import { Button } from '@material-ui/core';
import { UserState, setAuth } from '../stores/user';

interface SpotifyTokenResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string | null;
}

const Callback: FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const state: UserState = useSelector((rootState: RootState) => rootState.user);
    const [params, setParams] = useState<StrKeyObj>();

    useEffect(() => {
        const queryStr: string = window.location.search;
        const results: StrKeyObj = getParameters(queryStr);
        setParams(results);
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

    // CloudFunctions経由で、Spotifyのアクセストークン認証
    // その後、Firestoreにアカウントを作成、カスタムトークンを受領
    const requestFirestoreCustomToken = async (): Promise<void> => {
        if (!params) return;
        const spotifyToken: firebase.functions.HttpsCallable = f.httpsCallable('spotifyToken');
        const res: SpotifyTokenResponse = await spotifyToken(params);
        const customToken: string | null = res.data;
        if (!customToken) return;
        auth.signInWithCustomToken(customToken)
            .then(response => {
                console.log(`ログイン成功 uid：${response.user?.uid}`);
                console.log(`ログイン成功 refreshToken：${response.user?.refreshToken}`);
                if (!response.user) {
                    history.push('/error');
                    return;
                }
                const newState: UserState = Object.assign(state, {
                    uid: response.user.uid,
                    signedIn: true,
                    refreshToken: response.user.refreshToken,
                });
                dispatch(setAuth(newState));
                history.push('/');
            })
            .catch(error => {
                console.log(`カスタムトークンによるログインでエラーが発生しました：${error.message} (ErrorCode ${error.code})`);
                history.push('/error');
            });
    };

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
        <div>
            <Button
                onClick={requestFirestoreCustomToken}
            >
                アカウント作成
            </Button>
        </div>
    )
};

export default withRouter(Callback);