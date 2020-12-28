import React, { FC, useEffect, useState, KeyboardEvent, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import firebase, { f, auth } from './firebase';
import PrivateRoute from './routes/PrivateRoute';
import GuestRoute from './routes/GuestRoute';
import Home from './components/Home';
import Album from './components/Album';
import Search from './components/Search';
import Account from './components/Account';
import Callback from './components/Callback';
import NotFound from './components/NotFound';
import { setUserProfile, setAuth, setClearUser } from './stores/user';
import { StrKeyObj, Auth } from './utils/types';
import { UserProfile } from './utils/interfaces';
import { home, album, artist, account, callback, search } from './utils/paths';
import { v4 as uuidv4 } from 'uuid';
import {
    SwipeableDrawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppSharpIcon from '@material-ui/icons/ExitToAppSharp';

interface SpotifyRedirectResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

const App: FC = () => {
    const dispatch = useDispatch();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userExists, setUserExists] = useState(false);

    useEffect(() => {
        // Firebase Authチェック（ログイン状態が変更されるたびに発火する）
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUserExists(user !== null);
            if (user) {
                console.log(`ログイン中です：${user.displayName}`);
                const newProfile: UserProfile = {
                    uid: user.uid,
                    displayName: user.displayName || user.uid,
                    email: user.email || '',
                    photoURL: user.photoURL,
                };
                dispatch(setUserProfile(newProfile));
                const newAuth: Auth = {
                    signedIn: true,
                    refreshToken: user.refreshToken,
                    emailVerified: user.emailVerified,
                };
                dispatch(setAuth(newAuth));
            } else {
                console.log(`ログインしていません`);
                dispatch(setClearUser());
            }
        });
        return () => unsubscribe();
    });

    // サインイン／アウト
    const signInOut = async (): Promise<void> => {
        if (userExists) {
            await auth.signOut();
            return;
        }
        // CloudFunctions経由でauthorizeURLをリクエストし、そこへリダイレクト
        const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotify_redirect');
        const param: StrKeyObj = { state: uuidv4() };
        const response: SpotifyRedirectResponse = await spotifyRedirect(param);
        window.location.href = response.data;
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
                <Link to={account}>
                    <ListItem button key={'account'}>
                        <ListItemIcon><PersonIcon /></ListItemIcon><ListItemText primary={'マイページ'} />
                    </ListItem>
                </Link>
            </List>
            <Divider />
            <List>
                <ListItem button key={'signInOut'} onClick={signInOut}>
                    <ListItemIcon><ExitToAppSharpIcon /></ListItemIcon>
                    <ListItemText primary={userExists ? 'ログアウト' : 'Spotifyでログイン'} />
                </ListItem>
            </List>
        </div>
    );
    
    return (
        <BrowserRouter>
            <Link to={home}>Labels</Link>
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
                <Route path={home} exact component={Home} />
                <PrivateRoute path={album} component={Album} />
                <PrivateRoute path={search} component={Search} />
                <PrivateRoute path={account} component={Account} />
                <GuestRoute path={callback} component={Callback} />
                <Route component={NotFound} />
            </Switch>
        </BrowserRouter>
    )
}

export default App;
