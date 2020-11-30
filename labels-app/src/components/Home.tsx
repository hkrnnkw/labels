import React, { FC, useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/index';
import { Snackbar } from '@material-ui/core';

interface Props extends RouteComponentProps {

}

const Home: FC<Props> = () => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { email, emailVerified } = useSelector((rootState: RootState) => rootState.user);

    useEffect(() => {
        if (!emailVerified) sendEmailVerification();
    }, []);

    // TODO 確認メール送信
    const sendEmailVerification = () => {

        setSnackbarOpen(true);
    };

    // スナックバーを閉じる
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                message={`${email}に確認メールを送信しました`}
            />
        </div>
    )
};

export default withRouter(Home);