import React, { FC, useEffect, useState } from 'react';
import { withRouter, useLocation } from 'react-router';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import firebase, { f, auth } from '../firebase';
import { StrKeyObj, Spotify } from '../utils/types';
import { Typography } from '@material-ui/core';
import { home, errorOccurred, userNotFound } from '../utils/paths';
import { setSpotifyTokens } from '../stores/user';
import { switchIsProcessing } from '../stores/app';

interface SpotifySignInResponse extends firebase.functions.HttpsCallableResult {
    readonly data: [string, Spotify];
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        top: '64px',
        display: 'flex',
        justifyContent: 'center',
        '& p': {
            height: '44px',
            padding: theme.spacing(2),
            position: 'absolute',
            top: '200px',
            color: theme.palette.text.primary,
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Callback: FC = () => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const location = useLocation();
    const [path, setPath] = useState<string>();

    useEffect(() => {
        dispatch(switchIsProcessing(true));
        window.scrollTo(0, 0);
    }, [dispatch]);

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
            .catch(err => setPath(errorOccurred));
    }, [location.search, dispatch]);

    return path ?
        <Redirect to={path} />
        :
        <div className={classes.contentClass}>
            <Typography>Signing in...</Typography>
        </div>;
};

export default withRouter(Callback);