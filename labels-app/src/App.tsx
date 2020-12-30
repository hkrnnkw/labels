import React, { FC, useEffect, useState, KeyboardEvent, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Switch, Route, Link as RouterLink } from 'react-router-dom';
import { auth } from './firebase';
import PrivateRoute from './routes/PrivateRoute';
import GuestRoute from './routes/GuestRoute';
import Home from './components/Home';
import Album from './components/Album';
import Artist from './components/Artist';
import Search from './components/Search';
import Account from './components/Account';
import Callback from './components/Callback';
import NotFound from './components/NotFound';
import { setUserProfile, setAuth, setClearUser } from './stores/user';
import { Auth } from './utils/types';
import { UserProfile } from './utils/interfaces';
import { home, album, artist, account, callback, search } from './utils/paths';
import {
    SwipeableDrawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, Link,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppSharpIcon from '@material-ui/icons/ExitToAppSharp';
import { signIn } from './handlers/spotifyHandler';

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
    }, []);

    // サインイン／アウト
    const signInOut = async (): Promise<void> => {
        userExists ? await auth.signOut() : await signIn();
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
                    <ListItemText primary={userExists ? 'ログアウト' : 'Spotifyでログイン'} />
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
                <Route path={home} exact component={Home} />
                <PrivateRoute path={album} component={Album} />
                <PrivateRoute path={artist} component={Artist} />
                <PrivateRoute path={search} component={Search} />
                <PrivateRoute path={account} component={Account} />
                <GuestRoute path={callback} component={Callback} />
                <Route component={NotFound} />
            </Switch>
        </BrowserRouter>
    )
}

export default App;
