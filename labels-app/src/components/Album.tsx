import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Avatar, List, ListItem,
} from '@material-ui/core';
import { RootState } from '../stores/index';
import { Album as AlbumObj, Artist } from '../utils/interfaces';
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
    const { artists: simpleArtists, images, name: title, label, tracks, release_date } = state.album;
    const [fullArtists, setFullArtists] = useState<Artist[]>([]);
    const { spotify } = useSelector((rootState: RootState) => rootState.user);
    const { token, refreshToken, expiresIn } = spotify;

    // アーティストの情報を取得
    const fetchArtists = async () => {
        try {
            const artistIds: string[] = simpleArtists.map(artist => artist.id);
            const results: Artist[] = await getArtists(artistIds, token, refreshToken, expiresIn).catch();
            setFullArtists(results);
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };
    useEffect(() => {
        fetchArtists().catch(err => console.log(err));
    });

    // アーティスト名を並べる
    const createArtistNames = (artists: Artist[]): JSX.Element[] => {
        const result: JSX.Element[] = [];
        for (let i = 0; i < artists.length; i++) {
            if (i !== 0) result.push(<Typography className={classes.comma}>, </Typography>);
            result.push(
                <Link to={{ pathname: `${artistPath}/${artists[i].id}`, state: { artist: artists[i] } }}>{artists[i].name}</Link>,
            );
        }
        return result;
    };

    return (
        <div className={classes.root}>
            <img
                src={images[0].url}
                alt={`${simpleArtists[0].name} - ${title}`}
                className={classes.jacket}
            />
            <Typography>{title}</Typography>
            <div className={classes.names}>
                {createArtistNames(fullArtists)}
            </div>
            <Typography>{label}</Typography>
            <List>
                {tracks.items.map(track => <ListItem>{track.name}</ListItem>)}
            </List>
            <Typography>{release_date}</Typography>
            <List>
                {fullArtists.map(artist => { return (
                    <Link to={{ pathname: `${artistPath}/${artist.id}`, state: { artist: artist } }} className={classes.artist}>
                        <ListItem>
                            <Avatar src={artist.images[0].url} className={classes.artistAvatar} />
                            <Typography className={classes.artistName}>{artist.name}</Typography>
                        </ListItem>
                    </Link>
                )})}
            </List>
        </div>
    )
};

export default withRouter(Album);