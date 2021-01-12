import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    GridList, GridListTile, GridListTileBar, Container, IconButton, Button, Link, Typography,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { setAddLabel } from '../stores/albums';
import { Favorite, Label, LabelEntry, SearchResult, SortOrder } from '../utils/types';
import { Props } from '../utils/interfaces';
import { album as albumPath, search as searchPath, label as labelPath } from '../utils/paths';
import { searchAlbums, signIn } from '../handlers/spotifyHandler';
import { getListOfFavLabelsFromFirestore, addFavLabelToFirestore } from '../handlers/dbHandler';
import { sortHandler } from '../handlers/sortHandler';

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
    const { home, sortOrder } = useSelector((rootState: RootState) => rootState.albums);
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        if (!signedIn) return;

        const getDefaultLabels = (): Label => {
            const defaults = [
                'PAN', 'Warp Records', 'XL Recordings', 'Stones Throw Records', 'Rough Trade', 'Ninja Tune', '4AD',
                'Brainfeeder', 'Dirty Hit', 'AD 93', 'Hyperdub', 'Jagjaguwar', 'Ghostly International', 'Dog Show Records',
                'Because Music', 'Text Records', 'Domino Recording Co', 'Perpetual Novice', 'EQT Recordings',
                'Republic Records', 'Smalltown Supersound', 'aritech',
            ];
            const labelObj: Label = {};
            for (const labelName of defaults) labelObj[labelName] = { date: -1, newReleases: [] };
            return labelObj;
        };

        // レーベルの情報を取得
        const fetchLabels = async () => {
            // Firestoreからフォロー中のレーベル群を取得
            const favLabels: Label = await getListOfFavLabelsFromFirestore(uid);
            const labelObj = Object.keys(favLabels).length ? favLabels : getDefaultLabels();

            const entries = Object.entries(labelObj);
            const token: string = await tokenChecker();
            const tasks = entries.map(([name, fav]) => searchAlbums({ label: name, getNew: true }, token));
            const results: SearchResult[] = await Promise.all(tasks);

            for (const [name, fav] of entries) {
                const searchResult = results.find(search => search.results.length && search.query.label === name);
                if (searchResult) labelObj[name] = { ...fav, newReleases: searchResult.results };
            }
            dispatch(setAddLabel(labelObj));
        };

        fetchLabels()
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [signedIn, uid, tokenChecker, dispatch]);

    // フォロー操作
    const handleFav = async (labelName: string) => {
        try {
            const newDate: number = await addFavLabelToFirestore(uid, labelName);
            const token: string = await tokenChecker();
            const result: SearchResult = await searchAlbums({ label: labelName, getNew: true }, token);
            const newHome: Label = { [labelName]: { date: newDate, newReleases: result.results } };
            dispatch(setAddLabel(newHome));
        } catch (err) {
            console.log(err);
        }
    };

    const generateAlbums = (name: string, fav: Favorite): JSX.Element => {
        const { date, newReleases } = fav;
        const albumGridListTiles: JSX.Element[] = newReleases.map(album => {
            return (
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
            );
        });
        return (
            <Container className={classes.container} id={name}>
                <Link
                    component={RouterLink}
                    to={{ pathname: `${labelPath}/${name}`, state: { label: name } }}
                    className={classes.labelName}
                >
                    {name}
                </Link>
                {date < 0 &&
                    <Button onClick={() => handleFav(name)}>フォロー</Button>
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

    const privateHome = (labelObj: Label, order: SortOrder): JSX.Element => {
        const sorted: LabelEntry[] = sortHandler(labelObj, order);
        const filtered = sorted.filter(([name, fav]) => fav.newReleases.length);
        return (
            <div className={classes.root}>
                <Link component={RouterLink} to={searchPath}><IconButton><SearchIcon /></IconButton></Link>
                {filtered.length > 0 ?
                    filtered.map(([name, fav]) => generateAlbums(name, fav))
                    :
                    <Typography>ニューリリースがありません</Typography>
                }
            </div>
        )
    };

    const guestHome = (disabled: boolean): JSX.Element => {
        return (
            <div className={classes.root}>
                <Button onClick={handleSignIn} disabled={disabled}>はじめる</Button>
                {/* TODO ローディングサークル出す */}
                {/* {disabled && } */}
            </div>
        )
    };

    return signedIn ? privateHome(home, sortOrder) : guestHome(clicked);
};

export default withRouter(Home);