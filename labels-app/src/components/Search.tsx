import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    List, ListItem, ListItemText, IconButton, TextField, Typography,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Album } from '../utils/interfaces';
import { SearchResult, Spotify } from '../utils/types';
import { album as albumPath } from '../utils/paths';
import { checkTokenExpired, getSavedAlbums, searchAlbums } from '../handlers/spotifyHandler';
import { setSaved, setSearch } from '../stores/albums';
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
    listItem: {
        width: '100%',
        float: 'left',
        padding: 0,
        marginBottom: theme.spacing(1),
    },
    jacket: {
        width: '20%',
        float: 'left',
        marginRight: theme.spacing(2),
    },
    listItemText: {
        width: '80%',
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
    const { spotify, uid } = useSelector((rootState: RootState) => rootState.user);
    const { saved, search } = useSelector((rootState: RootState) => rootState.albums);
    const [keywords, setKeywords] = useState<string>('');

    // ライブラリに保存したアルバムを取得
    const fetchSavedAlbums = async () => {
        try {
            const checkedToken: string | Spotify = await checkTokenExpired({ spotify }, uid);
            if (typeof checkedToken !== 'string') dispatch(setSpotifyTokens(checkedToken));
            const token: string = typeof checkedToken !== 'string' ? checkedToken.spotify.token : checkedToken;
            
            const results: Album[] = await getSavedAlbums(token);
            dispatch(setSaved(results));
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };
    useEffect(() => {
        if (!saved.length) fetchSavedAlbums().catch(err => console.log(err));
    }, []);

    // keywordsが空になったら、searchを初期化
    useEffect(() => {
        if (keywords.length) return;
        const searchResult: SearchResult = {
            search: { keywords: '', results: [] },
        }
        dispatch(setSearch(searchResult));
    }, [keywords]);

    // 検索実行
    const doSearching = async (str: string) => {
        try {
            const checkedToken: string | Spotify = await checkTokenExpired({ spotify }, uid);
            if (typeof checkedToken !== 'string') dispatch(setSpotifyTokens(checkedToken));
            const token: string = typeof checkedToken !== 'string' ? checkedToken.spotify.token : checkedToken;
            
            const results: Album[] = await searchAlbums(str, token);
            const searchResult: SearchResult = {
                search: { keywords: str, results: results },
            }
            dispatch(setSearch(searchResult));
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };

    // アルバムリストを生成
    const generateAlbums = (albums: Album[]): JSX.Element => {
        if (!albums.length && search.keywords.length) return <Typography>見つかりませんでした</Typography>;

        const albumListItems: JSX.Element[] = albums.map(album => {
            return (
                <ListItem
                    key={`${album.artists[0].name} - ${album.name}`}
                    className={classes.listItem}
                >
                    <Link to={{ pathname: `${albumPath}/${album.id}`, state: { album: album } }}>                    
                        <img
                            src={album.images[0].url}
                            alt={`${album.artists[0].name} - ${album.name}`}
                            className={classes.jacket}
                        />
                        <ListItemText
                            primary={album.name}
                            secondary={album.artists[0].name}
                            classes={{
                                root: classes.listItemText,
                            }}
                        />
                    </Link>
                </ListItem>
            );
        });
        return <List>{albumListItems}</List>;
    };

    return (
        <div className={classes.root}>
            <TextField
                id="search"
                value={keywords}
                placeholder="アーティストを検索"
                type="search"
                onChange={e => setKeywords(e.target.value)}
            />
            <IconButton
                onClick={() => doSearching(keywords)}
                disabled={!keywords.length || search.keywords === keywords}
            >
                <SearchIcon />
            </IconButton>
            {generateAlbums(search.keywords.length && keywords.length ? search.results : saved)}
        </div>
    )
};

export default withRouter(Search);