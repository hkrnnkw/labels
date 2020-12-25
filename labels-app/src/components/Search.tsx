import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    GridList, GridListTile, GridListTileBar,
} from '@material-ui/core';
import { Album, Artist } from '../utils/interfaces';
import { Image } from '../utils/types';
import { getSavedAlbums } from '../utils/spotifyHandler';
import { setSearch } from '../stores/albums';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
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
}));

const Search: FC = () => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const [savedAlbums, setSavedAlbums] = useState<Album[]>([]);
    const { spotify } = useSelector((rootState: RootState) => rootState.user);
    const { token, refreshToken, expiresIn } = spotify;

    const fetchSavedAlbums = async () => {
        try {
            const results: Album[] = await getSavedAlbums(token, refreshToken, expiresIn);
            setSavedAlbums(results);
            dispatch(setSearch(results));
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
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