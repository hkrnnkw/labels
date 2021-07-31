import React, { FC, useEffect } from 'react';
import { withRouter, useLocation } from 'react-router';
import { errorOccurred, userNotFound } from '../utils/paths';

const NotFound: FC = () => {
    const location = useLocation();
    const pathname: string = location.pathname;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    const getMessage = (path: string): string => {
        switch (path) {
            case errorOccurred:
                return 'エラーが発生しました';
            case userNotFound:
                return 'ログインできませんでした';
            default:
                return `${path}に合致するURLは存在しません`;
        };
    };
    const message: string = getMessage(pathname);

    return (
        <div>
            <p>{message}</p>
        </div>
    )
};

export default withRouter(NotFound);