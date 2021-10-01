import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Button, Fab, Typography,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { setNeedDefaults, setInitLabels } from '../stores/albums';
import { Label, SearchResult } from '../utils/types';
import { Props } from '../utils/interfaces';
import { paths } from '../utils/paths';
import { searchAlbums, signIn } from '../handlers/spotifyHandler';
import { getListOfFavLabelsFromFirestore } from '../handlers/dbHandler';
import { sortHandler } from '../handlers/sortHandler';
import { SortDrawer } from './custom/SortDrawer';
import { switchIsProcessing } from '../stores/app';
import { ContainerOfLabel } from './custom/ContainerOfLabel';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '52px',
        '&#guest': {
            width: `calc(100vw - ${theme.spacing(8)}px)`,
            margin: theme.spacing(0, 4),
            '& .MuiTypography-root': {
                position: 'absolute',
            },
            '& h1': {
                color: theme.palette.primary.main,
                fontSize: '3.2rem',
                fontWeight: 700,
                top: '40px',
            },
            '& h6': {
                color: theme.palette.text.secondary,
                '&.MuiTypography-subtitle1': {
                    top: '108px',
                    lineHeight: 1.4,
                },
                '&.MuiTypography-subtitle2': {
                    top: '260px',
                },
            },
            '& button': {
                width: '100%',
                height: '48px',
                color: theme.palette.background.default,
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '4px',
                position: 'absolute',
                top: '200px',
                '&:disabled': {
                    backgroundColor: theme.palette.secondary.dark,
                },
            },
        },
    },
    searchButton: {
        zIndex: 100,
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
        backgroundColor: theme.palette.secondary.main,
        '& .MuiFab-label': {
            color: theme.palette.background.default,
        },
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: theme.spacing(2, 0),
    },
    showAll: {
        width: '88px',
        height: '28px',
        fontSize: '0.8rem',
        margin: theme.spacing(0, 4),
        borderRadius: '14px',
        color: theme.palette.secondary.main,
        backgroundColor: 'transparent',
        border: `1px solid ${theme.palette.secondary.main}`,
        transition: 'none',
        padding: 0,
        verticalAlign: 'middle',
        textAlign: 'center',
        '&#selected': {
            color: theme.palette.background.default,
            backgroundColor: theme.palette.secondary.main,
            border: 'none',
        },
    },
    falsyMessage: {
        color: theme.palette.text.disabled,
        width: `calc(100vw - ${theme.spacing(8)}px)`,
        margin: theme.spacing(10, 4),
        textAlign: 'center',
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Home: FC<Props> = ({ tokenChecker }) => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { isProcessing } = useSelector((rootState: RootState) => rootState.app);
    const { signedIn, uid } = useSelector((rootState: RootState) => rootState.user);
    const { home, sortOrder, needDefaults } = useSelector((rootState: RootState) => rootState.albums);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Labels';
    }, []);

    useEffect(() => {
        // サインインしていない（uidがない）ならreturn
        if (!uid.length) return;
        // needDefaults === undefinedのとき（起動時）に、処理中フラグを立てる
        dispatch(switchIsProcessing(needDefaults === undefined));
        // needDefaultsが初期化済みであればreturn
        if (needDefaults !== undefined) return;

        // レーベルの情報を取得
        const fetchLabels = async () => {
            const favLabels: { [name: string]: number; } = await getListOfFavLabelsFromFirestore(uid);
            const keys = Object.keys(favLabels);
            
            const token: string = await tokenChecker();
            const tasks = keys.map(name => searchAlbums({ label: name, getNew: true }, token));
            const results: SearchResult[] = await Promise.all(tasks);

            const labelList: Label[] = results.map(result => {
                const labelName = result.query.label || '';
                return {
                    name: labelName,
                    date: favLabels[labelName] || -1,
                    newReleases: result.albums,
                } as Label;
            });
            dispatch(setInitLabels(labelList));
            // フォロー中のレーベル（keys）がなければ、needDefaultsをtrueにする
            dispatch(setNeedDefaults(keys.length <= 0));
        };

        fetchLabels()
            .catch(err => console.error(`Spotify fetching error: ${err}`));
    }, [uid, needDefaults, dispatch, tokenChecker]);

    // サインインButtonの制御
    const handleSignIn = async () => {
        dispatch(switchIsProcessing(true));
        await signIn();
    };
    
    // サインインしているときのホーム
    const privateHome = (sorted: Label[], falsyMessage: string): JSX.Element => (
        <div className={classes.contentClass}>
            <div className={classes.header}>
                <SortDrawer currentSortOrder={sortOrder} />
                <Button
                    className={classes.showAll}
                    id={showAll ? 'selected' : undefined}
                    onClick={() => setShowAll(!showAll)}
                >
                    Show all
                </Button>
            </div>
            <Fab color='primary' aria-label='search' component={RouterLink} to={paths.search} className={classes.searchButton}>
                <SearchIcon style={{ fontSize: 28 }} />
            </Fab>
            {needDefaults === undefined ? null :
                !sorted.length ?
                    <Typography className={classes.falsyMessage}>{falsyMessage}</Typography>
                    :
                    sorted.map(label => <ContainerOfLabel label={label} tokenChecker={tokenChecker} />)}
        </div>
    );

    // サインアウトしているときのホーム
    const guestHome = (disabled: boolean): JSX.Element => (
        <div className={classes.contentClass} id='guest'>
            <Typography variant='h1'>Labels</Typography>
            <Typography variant='subtitle1'>Do you know what's new on your favorite record label?</Typography>
            <Button onClick={handleSignIn} disabled={disabled}>
                Let's get started with Spotify
            </Button>
            <Typography variant='subtitle2'>Premium account required.</Typography>
        </div>
    );

    if (signedIn) {
        const falsyMessage: string = !home.length ? 'Not following any label.' : 'No releases recently.';
        const forSort: Label[] = showAll ? home : home.filter(label => label.newReleases.length);
        // フォロー中のレーベルがない（デフォルトが必要）とき、Suggestion.tsxへリダイレクト
        return needDefaults ? 
            <Redirect to={paths.suggestion} /> : privateHome(sortHandler(forSort, sortOrder), falsyMessage);
    }
    else if (signedIn === false) {
        return guestHome(isProcessing);
    }
    else return <div className={classes.contentClass} />;
};

export default withRouter(Home);