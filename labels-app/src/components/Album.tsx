import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Avatar, List, ListItem,
} from '@material-ui/core';
import { RootState } from '../stores/index';
import { Album as AlbumObj, Artist, SimpleArtist } from '../utils/interfaces';
import { artist as artistPath} from '../utils/paths';
import { getArtists } from '../handlers/spotifyHandler';

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
    artist: {
        display: 'flex',
        alignItems: 'center',
    },
    artistAvatar: {
        marginRight: '10px',
    },
    artistName: {

    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Album: FC = () => {
    const classes = ambiguousStyles();
    const { state } = useLocation<{ album: AlbumObj }>();
    const [artists, setArtists] = useState<Artist[]>([]);
    const { spotify } = useSelector((rootState: RootState) => rootState.user);
    const { token, refreshToken, expiresIn } = spotify;

    // アーティストの情報を取得
    const fetchArtists = async () => {
        try {
            const artistIds: string[] = state.album.artists.map(artist => artist.id);
            const results: Artist[] = await getArtists(artistIds, token, refreshToken, expiresIn).catch();
            setArtists(results);
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };
    useEffect(() => {
        fetchArtists().catch(err => console.log(err));
    });

    // アーティスト名を並べる
    const createArtistNames = (sa: SimpleArtist[]): JSX.Element[] => {
        const result: JSX.Element[] = [];
        for (let i = 0; i < sa.length; i++) {
            if (i !== 0) result.push(<Typography className={classes.comma}>, </Typography>);
            result.push(
                <Link to={{
                    pathname: `${artistPath}/${sa[i].id}`,
                    state: { artist: artists.find(artist => artist.id === sa[i].id) },
                }}>
                    {sa[i].name}
                </Link>,
            );
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
            {artists.length > 0 &&
                <List>
                    {artists.map(artist => { return (
                        <Link to={{ pathname: `${artistPath}/${artist.id}`, state: { artist: artist } }} className={classes.artist}>
                            <ListItem>
                                <Avatar src={artist.images[0].url} className={classes.artistAvatar} />
                                <Typography className={classes.artistName}>{artist.name}</Typography>
                            </ListItem>
                        </Link>
                    )})}
                </List>
            }
        </div>
    )
};

export default withRouter(Album);