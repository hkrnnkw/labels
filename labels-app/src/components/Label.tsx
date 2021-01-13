import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Link, Button, Container, GridList, GridListTile, GridListTileBar, Avatar,
} from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import { Props, Album, Artist } from '../utils/interfaces';
import { Label as LabelType, SearchResult, Year } from '../utils/types';
import { album as albumPath, artist as artistPath } from '../utils/paths';
import { setAddLabel, setDeleteLabel } from '../stores/albums';
import { getArtists, searchAlbums } from '../handlers/spotifyHandler';
import { addFavLabelToFirestore, deleteUnfavLabelFromFirestore } from '../handlers/dbHandler';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {

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
    year: {
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

const Label: FC<Props> = ({ tokenChecker }) => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { state } = useLocation<{ label: string }>();
    const { uid } = useSelector((rootState: RootState) => rootState.user);
    const { home } = useSelector((rootState: RootState) => rootState.albums);
    const dateOfFollow: number = home[state.label]?.date || -1;
    const [albumsOfYears, setAlbumsOfYears] = useState<Year>({});
    const [artistsOfLabel, setArtistsOfLabel] = useState<Artist[]>([]);

    // レーベルの各年のアルバムを取得
    useEffect(() => {
        const getLast5Years = (): number[] => {
            const today = new Date();
            const thisYear = today.getFullYear();
            return new Array(5).fill(thisYear).map((y: number, i: number) => y - i);
        };

        const fetchLabel = async (): Promise<Year> => {
            const token: string = await tokenChecker();
            const last5years: number[] = getLast5Years();
            const tasks = last5years.map(year => searchAlbums({ label: state.label, year: year.toString() }, token));
            const results: SearchResult[] = await Promise.all(tasks);

            const yearObj: Year = {};
            for (const result of results) yearObj[result.query.year || ''] = result.albums;
            return yearObj;
        };
        fetchLabel()
            .then(albums => setAlbumsOfYears(albums))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [state.label, tokenChecker]);

    // レーベルのアーティストを取得
    useEffect(() => {
        const years: Album[][] = Object.values(albumsOfYears);
        if (!years.length) return;

        const idSet = new Set<string>();
        for (const albums of years) {
            for (const album of albums) {
                for (const artist of album.artists) idSet.add(artist.id);
            }
        }

        const fetchArtists = async (): Promise<Artist[]> => {
            const token: string = await tokenChecker();
            return await getArtists(Array.from(idSet), token);
        };
        fetchArtists()
            .then(artists => setArtistsOfLabel(artists))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [albumsOfYears, tokenChecker]);

    // フォロー操作
    const handleFav = async () => {
        try {
            if (dateOfFollow > 0) {
                await deleteUnfavLabelFromFirestore(uid, state.label);
                dispatch(setDeleteLabel(state.label));
                return;
            }
            const newDate: number = await addFavLabelToFirestore(uid, state.label);
            const token: string = await tokenChecker();
            const result: SearchResult = await searchAlbums({ label: state.label, getNew: true }, token);
            const newHome: LabelType = { [state.label]: { date: newDate, newReleases: result.albums } };
            dispatch(setAddLabel(newHome));
        } catch (err) {
            console.log(err);
        }
    };

    const generateArtists = (artists: Artist[]): JSX.Element => (
        <AvatarGroup max={6}>
            {artists.map(artist => (
                <Link component={RouterLink} to={{ pathname: `${artistPath}/${artist}`, state: { artist: artist } }}>
                    <Avatar alt={artist.name} src={artist.images[0].url} />
                </Link>
            ))}
        </AvatarGroup>
    );

    const generateAlbums = (year: string, albums: Album[]): JSX.Element => {
        if (!albums.length) return (
            <Container className={classes.container} id={year}>
                <Typography className={classes.year}>{year}</Typography>
                <Typography>作品がありません</Typography>
            </Container>
        );

        const albumGridListTiles: JSX.Element[] = albums.map(album => (
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
            <Container className={classes.container} id={year}>
                <Typography className={classes.year}>{year}</Typography>
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

    const generateYears = (years: Year): JSX.Element[] => {
        const entries: [string, Album[]][] = Object.entries(years);
        const sorted = entries.sort((a, b) => a[0] > b[0] ? -1 : a[0] < b[0] ? 1 : 0);
        return sorted.map(([year, albums]) => generateAlbums(year, albums));
    };

    return (
        <div className={classes.root}>
            <Typography>{state.label}</Typography>
            <Button onClick={handleFav}>{dateOfFollow > 0 ? 'フォロー中' : 'フォロー'}</Button>
            {artistsOfLabel.length > 0 && generateArtists(artistsOfLabel)}
            {generateYears(albumsOfYears)}
        </div>
    )
};

export default withRouter(Label);