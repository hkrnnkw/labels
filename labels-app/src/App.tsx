import React, { FC } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Display from './views/Display';

const App: FC = () =>
    <BrowserRouter>
        <div className="App">
            <Switch>
                <Route path='/' exact component={Display} />
            </Switch>
        </div>
    </BrowserRouter>;

export default App;
