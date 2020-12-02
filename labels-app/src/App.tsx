import React, { FC } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './components/Home';
import Page from './components/Page';
import Callback from './components/Callback';
import Auth from './components/Auth';
import SignIn from './components/SignIn';
import NotFound from './components/NotFound';

const App: FC = () =>
    <BrowserRouter>
        <Switch>
            <Route path='/signin' exact component={SignIn} />
            <Route path='/callback' component={Callback} />
            <Auth>
                <Switch>
                    <Route path='/' exact component={Home} />
                    <Route exact path="/page" component={Page} />
                </Switch>
            </Auth>
            <Route path='/notfound' component={NotFound} />
        </Switch>
    </BrowserRouter>

export default App;
