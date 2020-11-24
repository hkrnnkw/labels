import React, { FC, useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './stores/index';
import firebase from 'firebase';
import 'firebase/functions';
import Display from './components/Display';
import Callback from './components/Callback';
import { Link } from '@material-ui/core';
import { StrKeyObj } from './utils/types';

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

    // ユニークな文字列を生成
    const getUniqueStr = (): string => {
        return new Date().getTime().toString(16) + Math.random().toString(32).substring(2);
    }

    useEffect(() => {
        initFirebase()
            .then(async (): Promise<void> => {
                const f = firebase.app().functions('asia-northeast1');
                // CloudFunctionsからauthorizeURLをリクエスト
                const spotifyRedirect: firebase.functions.HttpsCallable = f.httpsCallable('spotifyRedirect');
                const param: StrKeyObj = { state: getUniqueStr() };
                const res: SpotifyRedirectResponse = await spotifyRedirect(param);
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
