import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    List, ListItem, ListItemText, IconButton, TextField, Typography, Link,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Props, Album } from '../utils/interfaces';
import { SearchQuery, SearchResult } from '../utils/types';
import { album as albumPath } from '../utils/paths';
import { getSavedAlbums, searchAlbums } from '../handlers/spotifyHandler';
import { setSaved, setSearched, clearSearched } from '../stores/albums';

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

const Search: FC<Props> = ({ tokenChecker }) => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { saved, searched } = useSelector((rootState: RootState) => rootState.albums);
    const typed: string = searched.query.keywords || '';
    const [typing, setTyping] = useState<string>(typed);

    // ライブラリに保存したアルバムを取得
    useEffect(() => {
        if (saved.length) return;

        const fetchSavedAlbums = async () => {
            const token: string = await tokenChecker();
            const results: Album[] = await getSavedAlbums(token);
            dispatch(setSaved(results));
        };
        fetchSavedAlbums()
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [saved.length, tokenChecker, dispatch]);

    // typingが空になったらsearchedを初期化（typedが空文字の場合はreturn）
    useEffect(() => {
        if (typing.length || !typed.length) return;
        dispatch(clearSearched());
    }, [typed, typing, dispatch]);

    // 検索実行
    const doSearching = async (keywords: string) => {
        try {
            const token: string = await tokenChecker();
            const searchQuery: SearchQuery = { keywords: keywords };
            const result: SearchResult = await searchAlbums(searchQuery, token);
            dispatch(setSearched(result));
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };

    // アルバムリストを生成
    const generateAlbums = (albums: Album[]): JSX.Element => {
        if (!albums.length && typed.length) return <Typography>見つかりませんでした</Typography>;

        const albumListItems: JSX.Element[] = albums.map(album => {
            return (
                <ListItem
                    key={`${album.artists[0].name} - ${album.name}`}
                    className={classes.listItem}
                >
                    <Link component={RouterLink} to={{ pathname: `${albumPath}/${album.id}`, state: { album: album } }}>
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
                value={typing}
                placeholder="アーティストを検索"
                type="search"
                onChange={e => setTyping(e.target.value)}
            />
            <IconButton
                onClick={() => doSearching(typing)}
                disabled={!typing.length || typed === typing}
            >
                <SearchIcon />
            </IconButton>
            {generateAlbums(typed.length ? searched.albums : saved)}
        </div>
    )
};

export default withRouter(Search);