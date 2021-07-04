import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    GridList, GridListTile, GridListTileBar, Container, IconButton, Button, Link, Typography,
    Dialog, DialogActions, DialogContent,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { setNeedDefaults, setInitLabels, setAddLabel } from '../stores/albums';
import { Label, SearchResult, SortOrder } from '../utils/types';
import { Props } from '../utils/interfaces';
import { album as albumPath, search as searchPath, label as labelPath } from '../utils/paths';
import { searchAlbums, signIn } from '../handlers/spotifyHandler';
import { getListOfFavLabelsFromFirestore, addFavLabelToFirestore } from '../handlers/dbHandler';
import { sortHandler } from '../handlers/sortHandler';
import { CustomSwipeableDrawer } from './custom/CustomSwipeableDrawer';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {
        backgroundColor: theme.palette.background.default,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        padding: 0,
        marginBottom: '30px',
    },
    gridList: {
        flexWrap: 'nowrap',
        transform: 'translateZ(0)',
    },
    labelName: {
        width: '100%',
    },
    title: {
        color: '#FFFFFF',
    },
    titleBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    jacket: {
        width: '100%',
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

    // フォロー操作
    const handleFav = async (label: Label) => {
        try {
            label.date = await addFavLabelToFirestore(uid, label.name);
            dispatch(setAddLabel(label));
        } catch (err) {
            console.log(err);
        }
    };

    const generateAlbums = (label: Label): JSX.Element => {
        const { name, date, newReleases } = label;
        const albumGridListTiles: JSX.Element[] = newReleases.map(album => (
            <GridListTile
                key={`${album.artists[0].name} - ${album.name}`}
                cols={2}
                rows={0.8}
            >
                <Link component={RouterLink} to={{ pathname: `${albumPath}/${album.id}`, state: { album: album } }}>
                    <img
                        src={album.images[0].url}
                        alt={`${album.artists[0].name} - ${album.name}`}
                        className={classes.jacket}
                    />
                    <GridListTileBar
                        title={album.name}
                        subtitle={album.artists[0].name}
                        classes={{
                            root: classes.titleBar,
                            title: classes.title,
                        }}
                    />
                </Link>
            </GridListTile>
        ));
        return (
            <Container className={classes.container} id={name}>
                <Link
                    component={RouterLink}
                    to={{ pathname: `${labelPath}/${name}`, state: { labelName: name } }}
                    className={classes.labelName}
                >
                    {name}
                </Link>
                {date < 0 &&
                    <Button onClick={() => handleFav(label)}>フォロー</Button>
                }
                <GridList
                    className={classes.gridList}
                    cols={5}
                    spacing={8}
                >
                    {albumGridListTiles}
                </GridList>
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
            >
                <DialogContent>
                    {filtered.map(label => generateAlbums(label))}
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
                        <Typography>No releases recently</Typography>
                        :
                        sorted.map(label => generateAlbums(label))}
                {(drawerOpen && defaults.length > 0) && suggestDefaultLabels(defaults, drawerOpen)}
            </div>
        )
    };

    const guestHome = (disabled: boolean): JSX.Element => (
        <div className={classes.root}>
            <Button onClick={handleSignIn} disabled={disabled}>はじめる</Button>
            {/* TODO ローディングサークル出す */}
            {/* {disabled && } */}
        </div>
    );

    return signedIn ? privateHome(home, sortOrder, defaultLabels, needDefaults) : guestHome(clicked);
};

export default withRouter(Home);