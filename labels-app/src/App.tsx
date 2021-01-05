import React, { FC, useCallback, useEffect, useState, KeyboardEvent, MouseEvent } from 'react';
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
import Account from './components/Account';
import Callback from './components/Callback';
import NotFound from './components/NotFound';
import { RootState } from './stores';
import { setUserProfile, setAuth, setClearUser, setSpotifyTokens } from './stores/user';
import { Auth, Spotify } from './utils/types';
import { UserProfile } from './utils/interfaces';
import { home, album, artist, label, account, callback, search } from './utils/paths';
import {
    SwipeableDrawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, Link,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppSharpIcon from '@material-ui/icons/ExitToAppSharp';
import { checkTokenExpired, signIn } from './handlers/spotifyHandler';

const App: FC = () => {
    const dispatch = useDispatch();
    const { spotify, uid } = useSelector((rootState: RootState) => rootState.user);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [user, setUser] = useState<firebase.User | null>(null);

    // Firebase Authチェック（ログイン状態が変更されるたびに発火する）
    auth.onAuthStateChanged(firebaseUser => setUser(firebaseUser));

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
            signedIn: true,
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

    // サインイン／アウト
    const signInOut = async (): Promise<void> => {
        user ? await auth.signOut() : await signIn();
    };

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    // メニュー内部の作成
    const list = () => (
        <div
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <Link component={RouterLink} to={account}>
                    <ListItem button key={'account'}>
                        <ListItemIcon><PersonIcon /></ListItemIcon><ListItemText primary={'マイページ'} />
                    </ListItem>
                </Link>
            </List>
            <Divider />
            <List>
                <ListItem button key={'signInOut'} onClick={signInOut}>
                    <ListItemIcon><ExitToAppSharpIcon /></ListItemIcon>
                    <ListItemText primary={user ? 'ログアウト' : 'Spotifyでログイン'} />
                </ListItem>
            </List>
        </div>
    );
    
    return (
        <BrowserRouter>
            <Link component={RouterLink} to={home}>Labels</Link>
            <IconButton onClick={toggleDrawer(true)}><MenuIcon /></IconButton>
            <SwipeableDrawer
                anchor={'bottom'}
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
            >
                {list()}
            </SwipeableDrawer>
            <Switch>
                <Route path={home} exact render={() => <Home tokenChecker={tokenChecker} />} />
                <PrivateRoute path={album} render={() => <Album tokenChecker={tokenChecker} />} />
                <PrivateRoute path={artist} render={() => <Artist tokenChecker={tokenChecker} />} />
                <PrivateRoute path={label} render={() => <Label tokenChecker={tokenChecker} />} />
                <PrivateRoute path={search} render={() => <Search tokenChecker={tokenChecker} />} />
                <PrivateRoute path={account} render={() => <Account />} />
                <GuestRoute path={callback} component={Callback} />
                <Route component={NotFound} />
            </Switch>
        </BrowserRouter>
    )
}

export default App;
