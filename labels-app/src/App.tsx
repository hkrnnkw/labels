import React, { FC, useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import firebase from 'firebase';
import 'firebase/functions';
import Display from './views/Display';
import Callback from './views/Callback';
import { Link } from '@material-ui/core';

interface SpotifyRedirectResponse extends firebase.functions.HttpsCallableResult {
    readonly data: string;
}

const App: FC = () => {
    const [authUrl, setAuthUrl] = useState<string>();

    // Firebaseを構成
    const initFirebase = async (): Promise<void> => {
        const response = await fetch('/__/firebase/init.json');
        const config = await response.json();
        firebase.initializeApp(config);
    };

    useEffect(() => {
        initFirebase()
            .then(async (): Promise<void> => {
                const f = firebase.app().functions('asia-northeast1');
                // CloudFunctionsからauthorizeURLをリクエスト
                const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotifyRedirect');
                const res: SpotifyRedirectResponse = await spotifyRedirect();
                setAuthUrl(res.data);
            })
            .catch(err => console.log(`Firebase構成エラー：${err}`));
    }, []);

    return (
        <BrowserRouter>
            <div className="App">
                <Switch>
                    <Route path='/' exact component={Display} />
                    <Route path='/callback' component={Callback} />
                </Switch>
                <Link href={authUrl}>ログイン</Link>
            </div>
        </BrowserRouter>
    )
};

export default App;
