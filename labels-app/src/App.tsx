import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { auth } from './firebase';
import PrivateRoute from './routes/PrivateRoute';
import GuestRoute from './routes/GuestRoute';
import Home from './components/Home';
import Page from './components/Page';
import Account from './components/Account';
import Callback from './components/Callback';
import NotFound from './components/NotFound';
import { UserProfile, Auth, setUserProfile, setAuth, setClearUser } from './stores/user';
import { home, page, account, callback } from './utils/paths';

const App: FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Firebase Authチェック（ログイン状態が変更されるたびに発火する）
        const unsubscribe = auth.onAuthStateChanged(user => {
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
    
    return (
        <BrowserRouter>
            <Switch>
                <Route path={home} exact component={Home} />
                <Route path={page} component={Page} />
                <PrivateRoute path={account} component={Account} />
                <GuestRoute path={callback} component={Callback} />
                <Route component={NotFound} />
            </Switch>
        </BrowserRouter>
    )
}

export default App;
