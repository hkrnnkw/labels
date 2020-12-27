import React, { FC, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Avatar, List, ListItem,
} from '@material-ui/core';
import { RootState } from '../stores/index';
import { Album, Artist, SimpleArtist } from '../utils/interfaces';
import { page } from '../utils/paths';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {

    },
    jacket: {
        width: '100%',
    },
    names: {
        width: '97%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    comma: {
        display: 'inline',
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Page: FC = () => {
    const classes = ambiguousStyles();
    const { state } = useLocation<{ album: Album }>();

    // アーティスト名を並べる
    const createArtistNames = (sa: SimpleArtist[]): JSX.Element[] => {
        const result: JSX.Element[] = [];
        for (let i = 0; i < sa.length; i++) {
            if (i !== 0) result.push(<Typography className={classes.comma}>, </Typography>);
            result.push(<Link to={`${page}/${sa[i].id}`}>{sa[i].name}</Link>);
        }
        return result;
    };

    return (
        <div className={classes.root}>
            <img
                src={state.album.images[0].url}
                alt={`${state.album.artists[0].name} - ${state.album.name}`}
                className={classes.jacket}
            />
            <Typography>{state.album.name}</Typography>
            <div className={classes.names}>{createArtistNames(state.album.artists)}</div>
            <Typography>{state.album.label}</Typography>
            <List>
                {state.album.tracks.items.map(track => <ListItem>{track.name}</ListItem>)}
            </List>
            <Typography>{state.album.release_date}</Typography>
        </div>
    )
};

export default withRouter(Page);