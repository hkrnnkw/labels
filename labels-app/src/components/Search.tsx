import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    List, ListItem, ListItemText, TextField, Typography, Link, InputAdornment, Button,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Props, Album } from '../utils/interfaces';
import { SearchQuery, SearchResult } from '../utils/types';
import { album as albumPath } from '../utils/paths';
import { getSavedAlbums, searchAlbums } from '../handlers/spotifyHandler';
import { setSaved, setSearched, clearSearched } from '../stores/albums';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '48px',
    },
    searchbar: {
        display: 'inline-flex',
        justifyContent: 'space-between',
        width: '100vw',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1, 0),
        position: 'fixed',
        zIndex: 3,
        '& div.MuiFormControl-root.MuiTextField-root': {
            width: `calc(80vw - ${theme.spacing(4)}px)`,
            height: '36px',
            border: 'none',
            borderRadius: '4px',
            marginLeft: theme.spacing(4),
            '&:focus': {
                outline: 'none',
            },
            '& div.MuiOutlinedInput-adornedStart': {
                paddingLeft: theme.spacing(2),
                '& div.MuiInputAdornment-positionStart': {
                    marginRight: 0,
                },
            },
            '& input#outlined-search': {
                padding: theme.spacing(2),
            },
        },
        '& button.MuiButton-root': {
            padding: 0,
            color: theme.palette.primary.main,
            '&.Mui-disabled': {
                opacity: 0.26,
            },
            '& span.MuiButton-label': {
                width: '20vw',
                height: '36px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
        },
    },
    list: {
        height: '100%',
        margin: theme.spacing(13, 4, 0),
    },
    listItem: {
        width: `calc(100vw - ${theme.spacing(8)}px)`,
        float: 'left',
        padding: 0,
        marginBottom: theme.spacing(4),
        overflow: 'hidden',
        '& img': {
            width: '16vw',
            float: 'left',
            marginRight: theme.spacing(4),
        },
        '& div.MuiListItemText-multiline': {
            width: `calc(84vw - ${theme.spacing(12)}px)`,
            height: '16vw', // imgのwidthと同じ値
            margin: 0,
            float: 'left',
            whiteSpace: "nowrap",
            '& span': {
                fontSize: '1.2rem',
                lineHeight: '1.8rem',
                textOverflow: "ellipsis",
                overflow: "hidden",
            },
            '& p': {
                fontSize: '1.0rem',
                lineHeight: '2.0rem',
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
        // TODO 見つからない時のスタイル崩れ
        if (!albums.length && typed.length) return <Typography>Couldn't find "{typed}"</Typography>;

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
        return <List className={classes.list}>{albumListItems}</List>;
    };

    return (
        <div className={classes.contentClass}>
            <span className={classes.searchbar}>
                <TextField
                    id='outlined-search'
                    variant='outlined'
                    value={typing}
                    placeholder='Artists or albums'
                    type='search'
                    autoComplete='off'
                    onChange={(e) => setTyping(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position='start'><SearchIcon/></InputAdornment>,
                        spellCheck: false,
                        onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(event),
                    }}
                />
                <Button
                    onClick={() => doSearching(typing)}
                    disabled={!typing.length || typed === typing}
                >
                    Search
                </Button>
            </span>
            {generateAlbums(typed.length ? searched.albums : saved)}
        </div>
    )
};

export default withRouter(Search);