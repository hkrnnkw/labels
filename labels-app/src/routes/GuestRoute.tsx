import React, { FC } from 'react';
import { WithRouterStatics } from 'react-router';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/index';
import { paths } from '../utils/paths';

interface RouteProps {
    path: string;
    exact?: boolean;
    component: WithRouterStatics<FC<{}>>;
}

const GuestRoute: FC<RouteProps> = ({ path, exact, component }) => {
    const { signedIn } = useSelector((rootState: RootState) => rootState.user);
    return signedIn ?
        <Redirect to={paths.home} /> : <Route path={path} exact={exact} component={component.WrappedComponent} />;
}

export default GuestRoute;