import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Switch, Route, Link as RouterLink } from 'react-router-dom';
import firebase, { auth } from './firebase';
import PrivateRoute from './routes/PrivateRoute';
import GuestRoute from './routes/GuestRoute';
import Home from './components/Home';
import Album from './components/Album';
import Artist from './components/Artist';
import Label from './components/Label';
import Search from './components/Search';
import Callback from './components/Callback';
import NotFound from './components/NotFound';
import { SignOutDrawer } from './components/custom/SignOutDrawer';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Link, Typography } from '@material-ui/core';
import { RootState } from './stores';
import { setSpotifyTokens, setSignInStatus, setFirebaseUser } from './stores/user';
import { Spotify } from './utils/types';
import { home, album, artist, label, callback, search } from './utils/paths';
import { refreshSpotifyToken } from './handlers/spotifyHandler';
import axios from 'axios';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        maxHeight: '100vh',
        position: 'relative',
        backgroundColor: theme.palette.background.default,
    },
    header: {
        width: '100vw',
        height: '48px',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1299,
        paddingTop: theme.spacing(4),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '& div#title': {
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'flex-start',
            '& a.MuiLink-root': {
                fontSize: '1.25rem',
                padding: theme.spacing(0, 4),
            },
            '& a.MuiLink-underlineHover:hover': {
                textDecoration: 'none',
            },
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const App: FC = () => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { spotify, uid, displayName, photoURL, signedIn, refreshToken } = useSelector((rootState: RootState) => rootState.user);
    const [user, setUser] = useState<firebase.User | null>(null);

    // Firebase Authチェック（ログイン状態が変更されるたびに発火する）
    auth.onAuthStateChanged(firebaseUser => {
        const appValid: boolean = firebaseUser !== null;
        if (appValid !== signedIn) dispatch(setSignInStatus(appValid));
        setUser(firebaseUser);
    });

    useEffect(() => {
        document.body.style.backgroundColor = '#232424';
    }, []);

    useEffect(() => {
        if (user) dispatch(setFirebaseUser(user));
    }, [user, dispatch]);

    // リフレッシュトークンを用いてアクセストークンを更新、uidを取得
    const retrieveUidUsingRefreshToken = async (_refreshToken: string): Promise<string> => {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', _refreshToken);

        const url = `https://securetoken.googleapis.com/v1/token?key=${process.env.REACT_APP_FIREBASE_API_KEY}`;
        const res = await axios.post(url, params).catch(err => { throw err });
        const _uid: string = res.data.user_id;
        return _uid;
    };

    // FirebaseおよびSpotifyトークンの有効期限チェック
    const tokenChecker = useCallback(async (): Promise<string> => {
        const { token, expiresIn } = spotify;
        const now = new Date();
        if (now < new Date(expiresIn)) return token;

        // アクセストークンの期限が切れた場合
        const _uid: string = uid.length > 0 ? uid : await retrieveUidUsingRefreshToken(refreshToken);
        const refreshedSpotifyObj: Spotify = await refreshSpotifyToken(_uid);
        dispatch(setSpotifyTokens(refreshedSpotifyObj));
        return refreshedSpotifyObj.spotify.token;
    }, [spotify, uid, refreshToken, dispatch]);

    return (
        <BrowserRouter>
        <div className={classes.contentClass}>
            <div className={classes.header}>
                <div id='title'>
                    <Link component={RouterLink} to={home}>Labels</Link>
                    <Typography variant='subtitle2'>v0.1 beta</Typography>
                </div>
                {signedIn && <SignOutDrawer displayName={displayName} photoURL={photoURL} />}
            </div>
            <Switch>
                <Route path={home} exact render={() => <Home tokenChecker={tokenChecker} />} />
                <PrivateRoute path={album} render={() => <Album tokenChecker={tokenChecker} />} />
                <PrivateRoute path={artist} render={() => <Artist tokenChecker={tokenChecker} />} />
                <PrivateRoute path={label} render={() => <Label tokenChecker={tokenChecker} />} />
                <PrivateRoute path={search} render={() => <Search tokenChecker={tokenChecker} />} />
                <GuestRoute path={callback} component={Callback} />
                <Route component={NotFound} />
            </Switch>
        </div>
        </BrowserRouter>
    )
}

export default App;
