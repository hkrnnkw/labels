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
import { Label, SearchResult } from '../utils/types';
import { Props } from '../utils/interfaces';
import { search as searchPath, label as labelPath } from '../utils/paths';
import { searchAlbums, signIn } from '../handlers/spotifyHandler';
import { getListOfFavLabelsFromFirestore } from '../handlers/dbHandler';
import { sortHandler } from '../handlers/sortHandler';
import { SortDrawer } from './custom/SortDrawer';
import { CustomGridList } from './custom/CustomGridList';
import { FollowButton } from './custom/FollowButton';
import { switchIsProcessing } from '../stores/app';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '64px',
        '&#guest': {
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            '& button': {
                height: '48px',
                color: theme.palette.background.default,
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '24px',
                padding: theme.spacing(2, 6),
                position: 'absolute',
                top: '200px',
                '&:disabled': {
                    backgroundColor: theme.palette.secondary.dark,
                },
            },
            '& h6.MuiTypography-subtitle2': {
                position: 'absolute',
                top: '264px',
                color: theme.palette.text.secondary,
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
        margin: theme.spacing(1, 0, 2),
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
        '&#selected': {
            color: theme.palette.background.default,
            backgroundColor: theme.palette.secondary.main,
            border: 'none',
        },
    },
    falsyMessage: {
        color: theme.palette.text.secondary,
        width: `calc(100vw - ${theme.spacing(8)}px)`,
        margin: theme.spacing(10, 4),
        textAlign: 'center',
    },
    container: {
        width: '100vw',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        padding: 0,
        margin: theme.spacing(0, 0, 7),
        '& p': {
            margin: theme.spacing(0, 4),
            color: theme.palette.text.secondary,
        },
    },
    labelName: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        height: '32px',
        fontSize: '1.6rem',
        lineHeight: 1.2,
        letterSpacing: '0.00938em',
        padding: theme.spacing(2, 0),
        margin: theme.spacing(0, 4),
        display: 'inline',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&#isDefault': {
            width: `calc(100vw - ${theme.spacing(30)}px)`,
            margin: theme.spacing(0, 2, 0, 4),
        },
    },
    dialog: {
        '& .MuiDialog-container': {
            height: 'max-content',
        },
        '& .MuiDialog-paperScrollPaper': {
            height: '100vh',
        },
        '& .MuiDialog-paper': {
            margin: 0,
            backgroundColor: theme.palette.background.paper,
        },
        '& .MuiDialogContent-root': {
            padding: 0,
            marginTop: theme.spacing(4),
            '& button': {
                margin: theme.spacing(0, 4, 0, 0),
                border: `1px ${theme.palette.secondary.dark} solid`,
                color: theme.palette.secondary.dark,
                '&#following': {
                    color: theme.palette.background.paper,
                    backgroundColor: theme.palette.secondary.dark,
                },
            },
            '& .MuiTypography-subtitle2': {
                color: theme.palette.secondary.light,
            },
        },
        '& .MuiDialogActions-root': {
            backgroundColor: theme.palette.text.primary,
            '& button': {
                color: theme.palette.background.paper,
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
        window.scrollTo(0, 0);
        document.title = 'Labels';
    }, []);

    useEffect(() => {
        if (!uid.length) return;
        const needToInit: boolean = Object.keys(home).length <= 0 || needDefaults !== false;
        dispatch(switchIsProcessing(needToInit));
        if (!needToInit) return;

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
            const labelNames: string[] = haveFav ? keys : DEFAULT_LABELS;
            
            const token: string = await tokenChecker();
            const tasks = labelNames.map(name => searchAlbums({ label: name, getNew: true }, token));
            const results: SearchResult[] = await Promise.all(tasks);

            const labelList: Label[] = results.flatMap(result => {
                if (!haveFav && !result.albums.length) return [];
                const labelName = result.query.label || '';
                return {
                    name: labelName,
                    date: favLabels[labelName] || -1,
                    newReleases: result.albums,
                }
            });
            haveFav ? dispatch(setInitLabels(labelList)) : setDefaultLabels(labelList);
            if (needDefaults === undefined) dispatch(setNeedDefaults(!haveFav));
        };

        fetchLabels()
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [uid, home, needDefaults, dispatch, tokenChecker]);

    const generateAlbumsOfLabel = (label: Label, isDefault: boolean = false): JSX.Element => {
        const { name: labelName, newReleases } = label;
        return (
            <Container className={classes.container} id={labelName}>
                <Link
                    className={classes.labelName}
                    id={isDefault ? 'isDefault' : undefined}
                    component={RouterLink}
                    to={{ pathname: `${labelPath}/${labelName}`, state: { labelName: labelName } }}
                >
                    {labelName}
                </Link>
                {isDefault && <FollowButton labelName={labelName} tokenChecker={tokenChecker} />}
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
        dispatch(switchIsProcessing(true));
        await signIn();
    };

    const handleClose = () => dispatch(setNeedDefaults(false));

    const suggestDefaultLabels = (defaults: Label[], drawerOpen: boolean): JSX.Element => (
        <Dialog
            open={drawerOpen}
            onClose={handleClose}
            className={classes.dialog}
            fullScreen={true}
        >
            <DialogContent>
                {defaults.map(label => generateAlbumsOfLabel(label, true))}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Skip</Button>
            </DialogActions>
        </Dialog>
    );
    
    const privateHome = (sorted: Label[], defaults: Label[], falsyMessage: string, drawerOpen?: boolean): JSX.Element => (
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
                <SearchIcon style={{ fontSize: 28 }} />
            </Fab>
            {drawerOpen === undefined ? null :
                !sorted.length ?
                    <Typography className={classes.falsyMessage}>{falsyMessage}</Typography>
                    :
                    sorted.map(label => generateAlbumsOfLabel(label))}
            {(drawerOpen && defaults.length > 0) && suggestDefaultLabels(defaults, drawerOpen)}
        </div>
    );

    const guestHome = (disabled: boolean): JSX.Element => (
        <div className={classes.contentClass} id='guest'>
            <Button onClick={handleSignIn} disabled={disabled}>
                Let's get started with Spotify
            </Button>
            <Typography variant='subtitle2'>Premium account required.</Typography>
        </div>
    );

    if (signedIn) {
        const falsyMessage: string = !home.length ? 'Not following any label.' : 'No releases recently.';
        const forSort: Label[] = showAll ? home : home.filter(label => label.newReleases.length);
        return privateHome(sortHandler(forSort, sortOrder), defaultLabels, falsyMessage, needDefaults);
    }
    else if (signedIn === false) {
        return guestHome(clicked);
    }
    else return <div className={classes.contentClass} />;
};

export default withRouter(Home);