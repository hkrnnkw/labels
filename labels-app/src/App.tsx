import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { auth } from './firebase';
import Home from './components/Home';
import Page from './components/Page';
import Callback from './components/Callback';
import NotFound from './components/NotFound';
import { UserState, setUserProfile } from './stores/user';
import { home, page, callback } from './utils/paths';

const App: FC = () => {
    const dispatch = useDispatch();

    // Firebaseログインチェック
    const didLogInFireAuth = () => {
        auth.onAuthStateChanged(user => {
            console.log(`Firebaseログインチェック：${user?.displayName}`);
            if (!user) return;
            const newState: UserState = {
                uid: user.uid,
                signedIn: true,
                refreshToken: user.refreshToken,
                displayName: user.displayName || user.uid,
                email: user.email || '',
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
            };
            dispatch(setUserProfile(newState));
        });
    };
    useEffect(didLogInFireAuth, []);
    
    return (
        <BrowserRouter>
            <Switch>
                <Route path={home} exact component={Home} />
                <Route path={page} component={Page} />
                <Route path={callback} component={Callback} />
                <Route component={NotFound} />
            </Switch>
        </BrowserRouter>
    )
}

export default App;
