import React, { FC, useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { useSelector } from 'react-redux';
import firebase, { f } from '../firebase';
import { RootState } from '../stores/index';
import { Button, Snackbar } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';
import { StrKeyObj } from '../utils/types';

interface SpotifyRedirectResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

interface Props extends RouteComponentProps {

}

const Home: FC<Props> = () => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { signedIn, email, emailVerified } = useSelector((rootState: RootState) => rootState.user);

    useEffect(() => {
        console.log(`Homeを表示します`);
        if (signedIn && !emailVerified) sendEmailVerification();
    }, []);

    // TODO 確認メール送信
    const sendEmailVerification = () => {

        setSnackbarOpen(true);
    };

    // スナックバーを閉じる
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // CloudFunctions経由でauthorizeURLをリクエストし、そこへリダイレクト
    const requestAuthUrl = async (): Promise<void> => {
        const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotifyRedirect');
        const param: StrKeyObj = { state: uuidv4() };
        const response: SpotifyRedirectResponse = await spotifyRedirect(param);
        window.location.href = response.data;
    };

    return (
        <div>
            {signedIn ?
                <p>ログイン済みです</p> : <Button onClick={requestAuthUrl}>Spotifyでログイン</Button>
            }
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