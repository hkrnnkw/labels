import React, { FC, useEffect } from 'react';
import { withRouter, useLocation } from 'react-router';
import { errorOccurred, userNotFound } from '../utils/paths';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core/';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        top: '64px',
        display: 'flex',
        justifyContent: 'center',
        '& p': {
            height: '44px',
            padding: theme.spacing(2),
            position: 'absolute',
            top: '200px',
            color: theme.palette.error.light,
            textAlign: 'center',
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const NotFound: FC = () => {
    const classes = ambiguousStyles();
    const location = useLocation();
    const pathname: string = location.pathname;

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Labels - Error';
    }, []);
    
    const getMessage = (path: string): string => {
        switch (path) {
            case errorOccurred:
                return 'An error has occurred.';
            case userNotFound:
                return `Couldn't sign in.`;
            default:
                return '404 Not found';
        };
    };

    return (
        <div className={classes.contentClass}>
            <Typography>{getMessage(pathname)}</Typography>
        </div>
    )
};

export default withRouter(NotFound);