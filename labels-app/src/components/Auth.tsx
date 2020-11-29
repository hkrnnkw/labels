import React, { FC, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { auth } from '../firebase';
import { RootState } from '../stores/index';

const Auth: FC = (props) => {
    const { signedIn } = useSelector((state: RootState) => state.user, shallowEqual);

    useEffect(() => {
        // Firebaseログインチェック
        auth.onAuthStateChanged(user => {
            console.log(`ログインしていますか：${user !== null}`);
            // TODO 結果をstoreに格納
        });
    }, []);

    return (
        <div>
            {signedIn ? props.children : <Redirect to={'/signin'} />}
        </div>
    )
}
export default withRouter(Auth);