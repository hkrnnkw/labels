import React, { FC, useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import firebase, { f, auth } from '../firebase';
import { RootState } from '../stores/index';
import { Button, Snackbar } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';
import { StrKeyObj } from '../utils/types';
import { account } from '../utils/paths';
import axios from 'axios';

interface SpotifyRedirectResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

interface Props extends RouteComponentProps {

}

const Home: FC<Props> = () => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { signedIn, email, emailVerified, spotifyToken } = useSelector((rootState: RootState) => rootState.user);

    // レーベルの情報を取得
    const fetchLabels = async () => {
        const endpoint = `https://api.spotify.com/v1/search`;
        const label = 'PAN';
        const year = 2020;
        const search = `label%3A${label}%20AND%20year%3A${year}`;
        const type = 'album';
        const limit = 10;
        const offset = 5;
        const query = `?q=${search}&type=${type}&limit=${limit}&offset=${offset}`;
        const url = `${endpoint}${query}`;
        try {
            const getAlbumsOfLabels: firebase.functions.HttpsCallable = f.httpsCallable('spotify_getAlbumsOfLabels');
            const res: SpotifyRedirectResponse = await getAlbumsOfLabels();

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${spotifyToken}`,
                },
            });
            // TODO responseを加工
            Object.keys(response.data.albums.items).forEach(num => {
                const temp = response.data.albums.items[`${num}`];
                Object.keys(temp).forEach(key => {
                    console.log(`結果 ${num} : ${key} : ${temp[`${key}`]}`);
                });
                console.log(`////////////////// ${num} //////////////////`);
            });
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };
    useEffect(() => {
        if (signedIn && !emailVerified) sendEmailVerification();
        fetchLabels().catch(err => console.log(err));
    }, []);

    // TODO 確認メール送信
    const sendEmailVerification = () => {

        setSnackbarOpen(true);
    };

    // スナックバーを閉じる
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // サインイン／アウト
    const signInOut = async (): Promise<void> => {
        if (signedIn) {
            await auth.signOut();
            return;
        }
        // CloudFunctions経由でauthorizeURLをリクエストし、そこへリダイレクト
        const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotifyRedirect');
        const param: StrKeyObj = { state: uuidv4() };
        const response: SpotifyRedirectResponse = await spotifyRedirect(param);
        window.location.href = response.data;
    };

    return (
        <div>
            <Button onClick={signInOut}>{signedIn ? 'ログアウト' : 'Spotifyでログイン'}</Button>
            <Link to={account}>マイページ</Link>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                message={`${email}に確認メールを送信しました`}
            />
        </div>
    )
};

export default withRouter(Home);