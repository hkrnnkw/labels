import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
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
import { RootState } from './stores';
import { setUserProfile, setAuth, setClearUser, setSpotifyTokens } from './stores/user';
import { Auth, Spotify } from './utils/types';
import { UserProfile } from './utils/interfaces';
import { home, album, artist, label, callback, search } from './utils/paths';
import { checkTokenExpired } from './handlers/spotifyHandler';

const App: FC = () => {
    const dispatch = useDispatch();
    const { spotify, uid } = useSelector((rootState: RootState) => rootState.user);
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

    return (
        <BrowserRouter>
            <Switch>
                <Route path={home} exact render={() => <Home tokenChecker={tokenChecker} />} />
                <PrivateRoute path={album} render={() => <Album tokenChecker={tokenChecker} />} />
                <PrivateRoute path={artist} render={() => <Artist tokenChecker={tokenChecker} />} />
                <PrivateRoute path={label} render={() => <Label tokenChecker={tokenChecker} />} />
                <PrivateRoute path={search} render={() => <Search tokenChecker={tokenChecker} />} />
                <GuestRoute path={callback} component={Callback} />
                <Route component={NotFound} />
            </Switch>
        </BrowserRouter>
    )
}

export default App;
