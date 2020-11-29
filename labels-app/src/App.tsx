import React, { FC } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Display from './components/Display';
import Callback from './components/Callback';
import Auth from './components/Auth';
import SignIn from './components/SignIn';

const App: FC = () =>
    <BrowserRouter>
        <Switch>
            <Route path='/signin' exact component={SignIn} />
            <Route path='/callback' component={Callback} />
            <Auth>
                <Switch>
                    <Route path='/' exact component={Display} />
                    <Route exact path="/page" component={Display} />
                </Switch>
            </Auth>
        </Switch>
    </BrowserRouter>

export default App;
