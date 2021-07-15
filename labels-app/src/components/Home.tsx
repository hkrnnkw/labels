import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Container, Button, Fab, Link, Typography, Dialog, DialogActions, DialogContent,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { setNeedDefaults, setInitLabels } from '../stores/albums';
import { Label, SearchResult, SortOrder } from '../utils/types';
import { Props } from '../utils/interfaces';
import { search as searchPath, label as labelPath } from '../utils/paths';
import { searchAlbums, signIn } from '../handlers/spotifyHandler';
import { getListOfFavLabelsFromFirestore } from '../handlers/dbHandler';
import { sortHandler } from '../handlers/sortHandler';
import { SortDrawer } from './custom/SortDrawer';
import { CustomGridList } from './custom/CustomGridList';
import { FollowButton } from './custom/FollowButton';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '48px',
    },
    searchButton: {
        zIndex: 100,
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
    },
    signInButton:{

    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    showAll: {
        width: '88px',
        height: '28px',
        fontSize: '0.8rem',
        margin: theme.spacing(0, 4),
        borderRadius: '14px',
        color: theme.palette.primary.light,
        border: `1px solid ${theme.palette.primary.light}`,
        backgroundColor: 'transparent',
        transition: 'none',
        '&#selected': {
            color: theme.palette.background.default,
            border: 'none',
            backgroundColor: theme.palette.primary.light,
        },
    },
    falsyMessage: {
        width: `calc(100vw - ${theme.spacing(8)}px)`,
        margin: theme.spacing(10, 4),
        textAlign: 'center',
    },
    container: {
        width: '100vw',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        overflow: 'hidden',
        padding: 0,
        margin: theme.spacing(2, 0, 6),
        '& p': {
            margin: theme.spacing(0, 4),
        },
    },
    labelName: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        fontSize: '1.6rem',
        padding: theme.spacing(2, 0),
        margin: theme.spacing(0, 4),
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        '&#isDefault': {
            width: `calc(75% - ${theme.spacing(4)}px)`,
            margin: theme.spacing(0, 0, 0, 4),
        },
    },
    dialog: {
        '& button': {
            textTransform: 'none',
            fontSize: '0.8rem',
            fontWeight: 700,
        },
        '& .MuiDialog-container': {
            height: 'max-content',
        },
        '& .MuiDialog-paperScrollPaper': {
            height: '100vh',
        },
        '& .MuiDialog-paper': {
            margin: 0,
        },
        '& .MuiDialogContent-root': {
            padding: 0,
            marginTop: theme.spacing(4),
            '& button': {
                width: `calc(25% - ${theme.spacing(4)}px)`,
                margin: theme.spacing(0, 2),
                padding: theme.spacing(2),
                '& .MuiButton-label': {
                    display: 'initial',
                },
            },
        },
        '& .MuiDialogActions-root': {
            backgroundColor: theme.palette.primary.main,
            '& button': {
                color: '#FFFFFF',
            },
        },
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
    const { signedIn, uid } = useSelector((rootState: RootState) => rootState.user);
    const { home, sortOrder, needDefaults } = useSelector((rootState: RootState) => rootState.albums);
    const [clicked, setClicked] = useState(false);
    const [defaultLabels, setDefaultLabels] = useState<Label[]>([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (!uid.length || Object.keys(home).length || needDefaults === false) return;

        const DEFAULT_LABELS: string[] = [
            '4AD', 'AD 93', 'aritech', 'Because Music', 'Brainfeeder', 'Dirty Hit', 'Dog Show Records',
            'Domino Recording Co', 'EQT Recordings', 'Ghostly International', 'Hyperdub', 'Jagjaguwar',
            'Ninja Tune', 'PAN', 'Perpetual Novice', 'Republic Records', 'Rough Trade',
            'Smalltown Supersound', 'Stones Throw Records', 'Text Records', 'Warp Records', 'XL Recordings', 
        ];

        // レーベルの情報を取得
        const fetchLabels = async () => {
            const favLabels: { [name: string]: number; } = await getListOfFavLabelsFromFirestore(uid);
            const keys = Object.keys(favLabels);
            const haveFav = keys.length > 0;
            if (needDefaults === undefined) dispatch(setNeedDefaults(!haveFav));
            const labelNames: string[] = haveFav ? keys : DEFAULT_LABELS;
            
            const token: string = await tokenChecker();
            const tasks = labelNames.map(name => searchAlbums({ label: name, getNew: true }, token));
            const results: SearchResult[] = await Promise.all(tasks);

            const labelList: Label[] = results.map(result => {
                const name = result.query.label || '';
                return {
                    name: name,
                    date: favLabels[name] || -1,
                    newReleases: result.albums,
                }
            });
            haveFav ? dispatch(setInitLabels(labelList)) : setDefaultLabels(labelList);
        };

        fetchLabels()
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [uid, home, needDefaults, dispatch, tokenChecker]);

    const generateAlbumsOfLabel = (label: Label, isDefault: boolean = false): JSX.Element => {
        const { name, newReleases } = label;
        return (
            <Container className={classes.container} id={name}>
                <Link
                    className={classes.labelName}
                    id={isDefault ? 'isDefault' : undefined}
                    component={RouterLink}
                    to={{ pathname: `${labelPath}/${name}`, state: { labelName: name } }}
                >
                    {name}
                </Link>
                {isDefault && <FollowButton uid={uid} label={label} tokenChecker={tokenChecker} />}
                {!newReleases.length ?
                    <Typography>No releases recently.</Typography>
                    :
                    <CustomGridList albums={newReleases} />
                }
            </Container>
        );
    };

    // サインインButtonの制御
    const handleSignIn = async () => {
        setClicked(true);
        await signIn();
    };

    const handleClose = () => dispatch(setNeedDefaults(false));

    const suggestDefaultLabels = (defaults: Label[], drawerOpen: boolean): JSX.Element => {
        const filtered = defaults.filter(label => label.newReleases.length);
        return (
            <Dialog
                open={drawerOpen}
                onClose={handleClose}
                className={classes.dialog}
                fullScreen={true}
            >
                <DialogContent>
                    {filtered.map(label => generateAlbumsOfLabel(label, true))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Skip</Button>
                </DialogActions>
            </Dialog>
        )
    };
    
    const privateHome = (homeList: Label[], order: SortOrder, defaults: Label[], drawerOpen?: boolean): JSX.Element => {
        const filtered = homeList.filter(label => label.newReleases.length);
        const sorted: Label[] = sortHandler(showAll ? homeList : filtered, order);
        return (
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
                <Fab color='primary' aria-label='search' component={RouterLink} to={searchPath} className={classes.searchButton}>
                    <SearchIcon />
                </Fab>
                {!homeList.length ?
                    <Typography className={classes.falsyMessage}>Not following any label.</Typography>
                    :
                    !sorted.length ?
                        <Typography className={classes.falsyMessage}>No releases recently.</Typography>
                        :
                        sorted.map(label => generateAlbumsOfLabel(label))}
                {(drawerOpen && defaults.length > 0) && suggestDefaultLabels(defaults, drawerOpen)}
            </div>
        )
    };

    const guestHome = (disabled: boolean): JSX.Element => (
        <div className={classes.contentClass}>
            <Button onClick={handleSignIn} disabled={disabled} className={classes.signInButton}>
                Let's get started with Spotify.
            </Button>
            {/* TODO ローディングサークル出す */}
            {/* {disabled && } */}
        </div>
    );

    return signedIn ? privateHome(home, sortOrder, defaultLabels, needDefaults) : guestHome(clicked);
};

export default withRouter(Home);