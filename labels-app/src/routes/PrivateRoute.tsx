import React, { FC } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/index';
import { home } from '../utils/paths';

interface RouteProps {
    path: string;
    exact?: boolean;
    render: () => JSX.Element;
}

const PrivateRoute: FC<RouteProps> = ({ path, exact, render }) => {
    const { signedIn } = useSelector((rootState: RootState) => rootState.user);
    return signedIn ? <Route path={path} exact={exact} render={render} /> : <Redirect to={home} />;
}

export default PrivateRoute;