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
import { setUserProfile, setAuth, setClearUser, setSpotifyTokens, setSignInStatus } from './stores/user';
import { Auth, Spotify } from './utils/types';
import { UserProfile } from './utils/interfaces';
import { home, album, artist, label, callback, search } from './utils/paths';
import { checkTokenExpired } from './handlers/spotifyHandler';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        maxHeight: '100vh',
        position: 'relative',
    },
    header: {
        width: '100vw',
        backgroundColor: theme.palette.background.default,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 5,
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
    const { spotify, uid, displayName: userName, photoURL: userPic, signedIn } = useSelector((rootState: RootState) => rootState.user);
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

    // ユーザステータスの切替え
    useEffect(() => {
        if (!user) {
            console.log(`ログインしていません`);
            dispatch(setClearUser());
            return;
        }
        const { uid: userId, displayName, email, photoURL, refreshToken, emailVerified } = user;
        console.log(`ログイン中です：${displayName}`);
        const newProfile: UserProfile = {
            uid: userId,
            displayName: displayName || userId,
            email: email || '',
            photoURL: photoURL,
        };
        dispatch(setUserProfile(newProfile));
        const newAuth: Auth = {
            refreshToken: refreshToken,
            emailVerified: emailVerified,
        };
        dispatch(setAuth(newAuth));
    }, [user, dispatch]);

    // Spotifyトークンの有効期限チェック
    const tokenChecker = useCallback(async (): Promise<string> => {
        const checkedToken: string | Spotify = await checkTokenExpired({ spotify }, uid);
        if (typeof checkedToken === 'string') return checkedToken;

        dispatch(setSpotifyTokens(checkedToken));
        return checkedToken.spotify.token;
    }, [spotify, uid, dispatch]);

    return (
        <BrowserRouter>
        <div className={classes.contentClass}>
            <div className={classes.header}>
                <div id='title'>
                    <Link component={RouterLink} to={home}>Labels</Link>
                    <Typography variant='subtitle2'>v0.1 beta</Typography>
                </div>
                {signedIn && <SignOutDrawer displayName={userName} photoURL={userPic} />}
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
