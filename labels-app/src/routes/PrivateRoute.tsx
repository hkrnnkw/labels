import React, { FC } from 'react';
import { WithRouterStatics } from 'react-router';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/index';
import { home } from '../utils/paths';

interface RouteProps {
    path: string;
    exact?: boolean;
    component: WithRouterStatics<FC<{}>>;
}

const PrivateRoute: FC<RouteProps> = ({ path, exact, component }) => {
    const { signedIn } = useSelector((rootState: RootState) => rootState.user);
    console.log(`プライベートルート：${signedIn ? `認証済みなので${path}を表示します` : 'ログインしてください'}`);
    
    return signedIn ?
        <Route path={path} exact={exact} component={component.WrappedComponent} /> : <Redirect to={home} />;
}

export default PrivateRoute;