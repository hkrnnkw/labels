import React, { FC, useEffect } from 'react';
import { withRouter } from 'react-router';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Container, Typography } from '@material-ui/core';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        top: '52px',
        display: 'flex',
        justifyContent: 'center',
    },
    container: {
        width: `calc(100vw - ${theme.spacing(8)}px)`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        overflow: 'hidden',
        padding: 0,
        margin: theme.spacing(2, 4, 6),
        '& h2': {
            fontSize: '1.2rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
            padding: theme.spacing(2, 0),
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Licenses: FC = () => {
    const classes = ambiguousStyles();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Labels';
    }, []);

    return (
        <div className={classes.contentClass}>
            <Container className={classes.container}>
                <Typography variant='h2'>Open source licenses</Typography>
            </Container>
        </div>
    );
};

export default withRouter(Licenses);