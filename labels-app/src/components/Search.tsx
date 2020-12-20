import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/index';
import {
    createStyles, makeStyles, GridList, GridListTile, GridListTileBar,
} from '@material-ui/core';
import { Album, Image, Artist } from '../utils/types';
import axios from 'axios';
import { checkTokenExpired } from '../utils/spotifyHandler';

const ambiguousStyles = makeStyles(() =>
    createStyles({
        contentClass: {
            minHeight: '100vh',
        },
        root: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            overflow: 'hidden',
        },
        title: {
            color: '#FFFFFF',
        },
        titleBar: {
            background:
                'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
        },
        '@media (min-width: 960px)': {
            contentClass: {
                display: 'flex',
            },
        },
    }),
);

const Search: FC = () => {
    const classes = ambiguousStyles();
    const [savedAlbums, setSavedAlbums] = useState<Album[]>([]);
    const { spotify } = useSelector((rootState: RootState) => rootState.user);

    const fetchSavedAlbums = async () => {
        const token = await checkTokenExpired(spotify.token, spotify.refreshToken, spotify.expiresIn);
        const response = await axios.get(`https://api.spotify.com/v1/me/albums?limit=20`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const items = response.data.items;
        const results: Album[] = items.map((item: { album: Album; }) => item.album);
        setSavedAlbums(results);
    };
    useEffect(() => {
        fetchSavedAlbums().catch(err => console.log(err));
    }, []);

    const generateAlbums = (albums: Album[]): JSX.Element => {
        const albumGridListTiles: JSX.Element[] = albums.map(album => {
            const img = album.images[0] as Image;
            const artists = album.artists as Artist[];
            return <GridListTile key={`${artists[0].name} - ${album.name}`}>
                <img src={img.url} alt={`${artists[0].name} - ${album.name}`} />
                <GridListTileBar
                    title={album.name}
                    subtitle={artists[0].name}
                    classes={{
                        root: classes.titleBar,
                        title: classes.title,
                    }}
                />
            </GridListTile>;
        });
        return <GridList>
            {albumGridListTiles}
        </GridList>;
    };

    return (
        <div className={classes.root}>
            {savedAlbums.length > 0 &&
                generateAlbums(savedAlbums)
            }
        </div>
    )
};

export default withRouter(Search);