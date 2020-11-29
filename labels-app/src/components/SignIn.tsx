import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import firebase, { f } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { Link } from '@material-ui/core';
import { StrKeyObj } from '../utils/types';

interface SpotifyRedirectResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

const SignIn: FC = () => {
    const [authUrl, setAuthUrl] = useState<string>();

    // CloudFunctions経由でauthorizeURLをリクエスト
    const requestAuthUrl = async (): Promise<void> => {
        const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotifyRedirect');
        const param: StrKeyObj = { state: uuidv4() };
        await spotifyRedirect(param)
            .then((res: SpotifyRedirectResponse) => {
                setAuthUrl(res.data);
            })
            .catch(err => console.log(`エラーが発生 spotifyRedirect：${err}`));
    };

    useEffect(() => {
        requestAuthUrl().catch(err => console.log(`エラー：${err}`))
    }, []);

    return (
        <Link href={authUrl}>ログイン</Link>
    )
};

export default withRouter(SignIn);