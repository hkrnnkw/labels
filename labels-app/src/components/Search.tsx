import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    GridList, GridListTile, GridListTileBar,
} from '@material-ui/core';
import { Album } from '../utils/interfaces';
import { SearchResult, Spotify } from '../utils/types';
import { checkTokenExpired, getSavedAlbums } from '../handlers/spotifyHandler';
import { setSearch } from '../stores/albums';
import { setSpotifyTokens } from '../stores/user';

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
    const { spotify, uid } = useSelector((rootState: RootState) => rootState.user);

    const fetchSavedAlbums = async () => {
        try {
            const checkedToken: string | Spotify = await checkTokenExpired({ spotify }, uid);
            if (typeof checkedToken !== 'string') dispatch(setSpotifyTokens(checkedToken));
            const token: string = typeof checkedToken !== 'string' ? checkedToken.spotify.token : checkedToken;
            
            const results: Album[] = await getSavedAlbums(token);
            setSavedAlbums(results);
            const search: SearchResult = {
                search: { keywords: '', results: results },
            }
            dispatch(setSearch(search));
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };
    useEffect(() => {
        fetchSavedAlbums().catch(err => console.log(err));
    }, []);

    const generateAlbums = (albums: Album[]): JSX.Element => {
        const albumGridListTiles: JSX.Element[] = albums.map(album => {
            return <GridListTile key={`${album.artists[0].name} - ${album.name}`}>
                <img src={album.images[0].url} alt={`${album.artists[0].name} - ${album.name}`} />
                <GridListTileBar
                    title={album.name}
                    subtitle={album.artists[0].name}
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