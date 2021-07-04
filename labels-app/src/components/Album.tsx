import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Avatar, List, ListItem, Link,
} from '@material-ui/core';
import { Props, Album as AlbumObj, Artist } from '../utils/interfaces';
import { artist as artistPath, label as labelPath } from '../utils/paths';
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

const Album: FC<Props> = ({ tokenChecker }) => {
    const classes = ambiguousStyles();
    const { state } = useLocation<{ album: AlbumObj }>();
    const { artists: simpleArtists, images, name: title, label, tracks, release_date } = state.album;
    const [fullArtists, setFullArtists] = useState<Artist[]>([]);

    // アーティストの情報を取得
    useEffect(() => {
        const fetchArtists = async (): Promise<Artist[]> => {
            const token: string = await tokenChecker();
            const artistIds: string[] = simpleArtists.map(artist => artist.id);
            return await getArtists(artistIds, token);
        };
        fetchArtists()
            .then(artists => setFullArtists(artists))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [simpleArtists, tokenChecker]);

    // アーティスト名を並べる
    const createArtistNames = (artists: Artist[]): JSX.Element[] => {
        const result: JSX.Element[] = [];
        for (let i = 0; i < artists.length; i++) {
            if (i !== 0) result.push(<Typography className={classes.comma}>, </Typography>);
            result.push(
                <Link
                    component={RouterLink}
                    to={{ pathname: `${artistPath}/${artists[i].id}`, state: { artist: artists[i] } }}
                >
                    {artists[i].name}
                </Link>,
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
            <Link component={RouterLink} to={{ pathname: `${labelPath}/${label}`, state: { labelName: label } }}>{label}</Link>
            <List>
                {tracks.items.map(track => <ListItem>{track.name}</ListItem>)}
            </List>
            <Typography>{release_date}</Typography>
            <List>
                {fullArtists.map(artist => { return (
                    <Link component={RouterLink} to={{ pathname: `${artistPath}/${artist.id}`, state: { artist: artist } }} className={classes.artist}>
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