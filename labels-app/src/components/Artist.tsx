import React, { FC } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, List, ListItem, Link,
} from '@material-ui/core';
import { Album, Artist as ArtistObj } from '../utils/interfaces';
import { album } from '../utils/paths';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {

    },
    profile: {
        width: '100%',
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Artist: FC = () => {
    const classes = ambiguousStyles();
    const { state } = useLocation<{ artist: ArtistObj }>();

    return (
        <div className={classes.root}>
            <img
                src={state.artist.images[0].url}
                alt={state.artist.name}
                className={classes.profile}
            />
            <Typography>{state.artist.name}</Typography>
            <List>
                {/* TODO アルバムを取得  */}
            </List>
        </div>
    )
};

export default withRouter(Artist);