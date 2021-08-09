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
import Licenses from './components/Licenses';
import Search from './components/Search';
import Suggestion from './components/Suggestion';
import Callback from './components/Callback';
import NotFound from './components/NotFound';
import { ConfigDrawer } from './components/custom/ConfigDrawer';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { AppBar, LinearProgress, Link, Toolbar, Typography, useMediaQuery } from '@material-ui/core';
import { RootState } from './stores';
import { setSpotifyTokens, setSignInStatus, setFirebaseUser } from './stores/user';
import { Spotify } from './utils/types';
import { paths } from './utils/paths';
import { refreshSpotifyToken } from './handlers/spotifyHandler';
import axios from 'axios';
import QRCode from 'react-qr-code';
import labels_logo from './img/labels_logo.svg';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        maxHeight: '100vh',
        position: 'relative',
        backgroundColor: theme.palette.background.default,
        '&#wider': {
            width: '100vw',
            minHeight: `calc(100vh - 48px)`,
            height: 'max-content',
            top: '52px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            '& svg#qrCode': {
                position: 'absolute',
                top: '100px',
                border: `1px ${theme.palette.text.primary} solid`,
            },
            '& h6.MuiTypography-subtitle1': {
                position: 'absolute',
                top: '260px',
                color: theme.palette.text.secondary,
            },
        },
    },
    header: {
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1, 0),
        '& div.MuiToolbar-regular': {
            width: '100%',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 0,
        },
        '& div#title': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            '& a.MuiLink-root': {
                height: '36px',
                padding: theme.spacing(1, 4),
                '& img': {
                    width: '36px',
                    height: '36px',
                },
            },
        },
        '& .MuiLinearProgress-root': {
            width: '100vw',
            position: 'fixed',
            top: '48px',
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const App: FC = () => {
    const theme = useTheme();
    const isMobileSize: boolean = useMediaQuery(theme.breakpoints.down('xs'), {noSsr: true});
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { isProcessing } = useSelector((rootState: RootState) => rootState.app);
    const { token, exp, uid, displayName, photoURL, signedIn, refreshToken } = useSelector((rootState: RootState) => rootState.user);
    const [user, setUser] = useState<firebase.User | null>(null);

    // Firebase Authチェック（ログイン状態が変更されるたびに発火する）
    auth.onAuthStateChanged(firebaseUser => {
        const appValid: boolean = firebaseUser !== null;
        if (appValid !== signedIn) dispatch(setSignInStatus(appValid));
        setUser(firebaseUser);
    });

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
        const now = new Date();
        if (now < new Date(exp)) return token;

        // アクセストークンの期限が切れた場合
        const _uid: string = uid.length > 0 ? uid : await retrieveUidUsingRefreshToken(refreshToken);
        const refreshed: Spotify = await refreshSpotifyToken(_uid);
        dispatch(setSpotifyTokens(refreshed));
        return refreshed.token;
    }, [token, exp, uid, refreshToken, dispatch]);

    // モバイルサイト
    const mobileView: JSX.Element = (
        <Switch>
            <Route path={paths.home} exact render={() => <Home tokenChecker={tokenChecker} />} />
            <PrivateRoute path={paths.album} render={() => <Album tokenChecker={tokenChecker} />} />
            <PrivateRoute path={paths.artist} render={() => <Artist tokenChecker={tokenChecker} />} />
            <PrivateRoute path={paths.label} render={() => <Label tokenChecker={tokenChecker} />} />
            <PrivateRoute path={paths.search} render={() => <Search tokenChecker={tokenChecker} />} />
            <PrivateRoute path={paths.suggestion} render={() => <Suggestion tokenChecker={tokenChecker} />} />
            <GuestRoute path={paths.callback} component={Callback} />
            <Route path={paths.licenses} component={Licenses} />
            <Route component={NotFound} />
        </Switch>
    );

    // TODO mediumサイズとPCサイズに分離し、それぞれスタイリング
    const widerView: JSX.Element = (
        <div className={classes.contentClass} id='wider'>
            <QRCode
                value={'https://la-bels.web.app/'}
                size={128}
                fgColor={theme.palette.background.default}
                id='qrCode'
            />
            <Typography variant='subtitle1'>
                The current version only supports mobile site.
            </Typography>
        </div>
    );

    return (
        <BrowserRouter>
        <div className={classes.contentClass}>
            <AppBar position='fixed' className={classes.header}>
                <Toolbar>
                    <div id='title'>
                        <Link component={RouterLink} to={paths.home}>
                            <img src={labels_logo} alt="Labels_logo" />
                        </Link>
                        <Typography variant='subtitle2'>v0.1 beta</Typography>
                    </div>
                    {signedIn && <ConfigDrawer displayName={displayName} photoURL={photoURL} />}
                    {isProcessing && <LinearProgress color='secondary' />}
                </Toolbar>
            </AppBar>
            {isMobileSize ? mobileView : widerView}
        </div>
        </BrowserRouter>
    )
}

export default App;
