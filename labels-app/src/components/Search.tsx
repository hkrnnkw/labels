import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    List, ListItem, ListItemText, TextField, Typography, Link, InputAdornment,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Props, Album } from '../utils/interfaces';
import { SearchQuery, SearchResult } from '../utils/types';
import { album as albumPath, home as homePath } from '../utils/paths';
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
    searchbar: {
        display: 'inline-flex',
        justifyContent: 'space-between',
        width: '100vw',
        margin: '6px 0 12px',
        '& div.MuiFormControl-root.MuiTextField-root': {
            width: '76vw',
            height: '35px',
            border: 'none',
            borderRadius: '4px',
            marginLeft: '4vw',
            '&:focus': {
                outline: 'none',
            },
            '& div.MuiOutlinedInput-adornedStart': {
                paddingLeft: '8px',
                '& div.MuiInputAdornment-positionStart': {
                    marginRight: 0,
                },
            },
            '& input#outlined-search': {
                padding: '8px',
            },
        },
        '& a': {
            width: '20vw',
            height: '35px',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
    listItem: {
        width: '100%',
        float: 'left',
        padding: 0,
        marginBottom: theme.spacing(1),
        '& img': {
            width: '20%',
            float: 'left',
            marginRight: theme.spacing(2),
        },
        '& div': {
            whiteSpace: "nowrap",
            '& span': {
                textOverflow: "ellipsis",
                overflow: "hidden",
            },
            '& p': {
                textOverflow: "ellipsis",
                overflow: "hidden",
            },
        },
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
            console.log(`検索エラー：${err}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' || !typing.length || typed === typing) return;
        doSearching(typing).catch(err => console.log(err));
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
                        />
                        <ListItemText
                            primary={album.name}
                            secondary={album.artists[0].name}
                        />
                    </Link>
                </ListItem>
            );
        });
        return <List>{albumListItems}</List>;
    };

    return (
        <div className={classes.root}>
            <span className={classes.searchbar}>
                <TextField
                    id='outlined-search'
                    variant='outlined'
                    value={typing}
                    placeholder='Search'
                    type='search'
                    autoComplete='off'
                    onChange={(e) => setTyping(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position='start'><SearchIcon/></InputAdornment>,
                        spellCheck: false,
                        onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(event),
                    }}
                />
                <Link component={RouterLink} to={homePath}>Cancel</Link>
            </span>
            {generateAlbums(typed.length ? searched.albums : saved)}
        </div>
    )
};

export default withRouter(Search);