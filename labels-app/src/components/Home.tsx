import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Container, IconButton, Button, Link, Typography, Dialog, DialogActions, DialogContent,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { setNeedDefaults, setInitLabels } from '../stores/albums';
import { Label, SearchResult, SortOrder } from '../utils/types';
import { Props } from '../utils/interfaces';
import { search as searchPath, label as labelPath } from '../utils/paths';
import { searchAlbums, signIn } from '../handlers/spotifyHandler';
import { getListOfFavLabelsFromFirestore } from '../handlers/dbHandler';
import { sortHandler } from '../handlers/sortHandler';
import { CustomSwipeableDrawer } from './custom/CustomSwipeableDrawer';
import { CustomGridList } from './custom/CustomGridList';
import { FollowButton } from './custom/FollowButton';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {
        backgroundColor: theme.palette.background.default,
    },
    signInButton: {
        textTransform: 'none',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        padding: 0,
        marginBottom: '30px',
        '& a#labelName': {
            width: '75%',
            padding: '6px 0',
            display: 'flex',
            alignItems: 'center',
        },
        '& button': {
            width: '25%',
            textTransform: 'none',
            '& .MuiButton-label': {
                display: 'initial',
            },
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
        },
        '& .MuiDialogContent-root': {
            padding: 0,
        },
        '& .MuiContainer-root': {
            marginTop: '30px',
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

    const generateAlbumsOfLabel = (label: Label): JSX.Element => {
        const { name, newReleases } = label;
        return (
            <Container className={classes.container} id={name}>
                <Link
                    id={'labelName'}
                    component={RouterLink}
                    to={{ pathname: `${labelPath}/${name}`, state: { labelName: name } }}
                >
                    {name}
                </Link>
                <FollowButton uid={uid} label={label} tokenChecker={tokenChecker} />
                <CustomGridList albums={newReleases} />
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
            >
                <DialogContent>
                    {filtered.map(label => generateAlbumsOfLabel(label))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Skip</Button>
                </DialogActions>
            </Dialog>
        )
    };
    
    const privateHome = (homeList: Label[], order: SortOrder, defaults: Label[], drawerOpen?: boolean): JSX.Element => {
        const filtered = homeList.filter(label => label.newReleases.length);
        const sorted: Label[] = sortHandler(filtered, order);
        return (
            <div className={classes.root}>
                <Link component={RouterLink} to={searchPath}><IconButton><SearchIcon /></IconButton></Link>
                <CustomSwipeableDrawer currentSortOrder={sortOrder} disabled={!sorted.length} />
                {!homeList.length ?
                    <Typography>You have not followed labels yet.</Typography>
                    :
                    !sorted.length ?
                        <Typography>No releases recently.</Typography>
                        :
                        sorted.map(label => generateAlbumsOfLabel(label))}
                {(drawerOpen && defaults.length > 0) && suggestDefaultLabels(defaults, drawerOpen)}
            </div>
        )
    };

    const guestHome = (disabled: boolean): JSX.Element => (
        <div className={classes.root}>
            <Button onClick={handleSignIn} disabled={disabled} className={classes.signInButton}>
                Let's get started.
            </Button>
            {/* TODO ローディングサークル出す */}
            {/* {disabled && } */}
        </div>
    );

    return signedIn ? privateHome(home, sortOrder, defaultLabels, needDefaults) : guestHome(clicked);
};

export default withRouter(Home);