import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, GridList, GridListTile, GridListTileBar, Link, List, ListItem, ListItemText,
} from '@material-ui/core';
import { Props, Album, Artist as ArtistObj } from '../utils/interfaces';
import { album as albumPath } from '../utils/paths';
import { getArtistAlbums } from '../handlers/spotifyHandler';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {

    },
    profile: {
        width: '100%',
    },
    gridList: {
        flexWrap: 'nowrap',
        transform: 'translateZ(0)',
    },
    title: {
        color: '#FFFFFF',
    },
    titleBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    jacket: {
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
            <GridList
                className={classes.gridList}
                cols={5}
                spacing={8}
            >
                {albums.map(album => {
                    return (
                        <GridListTile
                            key={`${album.artists[0].name} - ${album.name}`}
                            cols={2}
                            rows={0.8}
                        >
                            <Link component={RouterLink} to={{ pathname: `${albumPath}/${album.id}`, state: { album: album } }}>
                                <img
                                    src={album.images[0].url}
                                    alt={`${album.artists[0].name} - ${album.name}`}
                                    className={classes.jacket}
                                />
                                <GridListTileBar
                                    title={album.name}
                                    subtitle={album.artists[0].name}
                                    classes={{
                                        root: classes.titleBar,
                                        title: classes.title,
                                    }}
                                />
                            </Link>
                        </GridListTile>
                    )
                })}
            </GridList>
        </div>
    )
};

export default withRouter(Artist);