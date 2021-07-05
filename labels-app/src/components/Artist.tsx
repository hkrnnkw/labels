import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, List, ListItem, ListItemText,
} from '@material-ui/core';
import { Props, Album, Artist as ArtistObj } from '../utils/interfaces';
import { getArtistAlbums } from '../handlers/spotifyHandler';
import { CustomGridList } from './custom/CustomGridList';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {
        backgroundColor: theme.palette.background.default,
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

const Artist: FC<Props> = ({ tokenChecker }) => {
    const classes = ambiguousStyles();
    const { state } = useLocation<{ artist: ArtistObj }>();
    const { id: artistId, name: artistName, genres, images } = state.artist;
    const [albums, setAlbums] = useState<Album[]>([]);

    useEffect(() => {
        const fetchAlbums = async (): Promise<Album[]> => {
            const token: string = await tokenChecker();
            return await getArtistAlbums(artistId, token);
        }
        fetchAlbums()
            .then(data => setAlbums(data))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [artistId, tokenChecker]);

    return (
        <div className={classes.root}>
            <img
                src={images[0].url}
                alt={artistName}
                className={classes.profile}
            />
            <Typography>{artistName}</Typography>
            {genres.length > 0 && <List>
                {genres.map(genre => {
                    return (
                        <ListItem>
                            <ListItemText>{genre}</ListItemText>
                        </ListItem>
                    )
                })}
            </List>}
            <CustomGridList albums={albums} />
        </div>
    )
};

export default withRouter(Artist);