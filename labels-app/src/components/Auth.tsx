import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { auth } from '../firebase';
import { RootState } from '../stores/index';
import { UserState, setAuth } from '../stores/user';

const Auth: FC = (props) => {
    const dispatch = useDispatch();
    const { signedIn, email } = useSelector((state: RootState) => state.user, shallowEqual);
    const [redirect, setRedirect] = useState<React.ReactNode>();

    useEffect(() => {
        if (signedIn) {
            setRedirect(props.children);
            return;
        }
        // Firebaseログインチェック
        auth.onAuthStateChanged(user => {
            if (!user) {
                setRedirect(<Redirect to={'/signin'} />);
                return;
            }
            const newState: UserState = {
                uid: user.uid,
                signedIn: true,
                refreshToken: user.refreshToken,
                displayName: user.displayName || user.uid,
                email: user.email || email,
                photoURL: user.photoURL,
            };
            dispatch(setAuth(newState));
            setRedirect(props.children);
        });
    }, []);

    return (
        <>{redirect}</>
    )
}
export default withRouter(Auth);