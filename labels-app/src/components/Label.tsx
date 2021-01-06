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
import { FavLabel } from '../utils/types';
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
    const { favLabels } = useSelector((rootState: RootState) => rootState.albums);
    const init = favLabels.find(favLabel => favLabel.labelName === state.label);
    const [fav, setFav] = useState<FavLabel | undefined>(init);
    const [albumsOfYears, setAlbumsOfYears] = useState<Album[][]>([]);
    const [artistsOfLabel, setArtistsOfLabel] = useState<Artist[]>([]);

    // レーベルの各年のアルバムを取得
    useEffect(() => {
        const fetchLabel = async (): Promise<Album[][]> => {
            const token: string = await tokenChecker();
            const today = new Date();
            const thisYear = today.getFullYear();
            const last5years: number[] = new Array(5).fill(thisYear).map((y, i) => y - i);
            const tasks = last5years.map(year => searchAlbums({ label: state.label, year: year }, token));
            return await Promise.all(tasks);
        };
        fetchLabel()
            .then(albums => setAlbumsOfYears(albums.filter(album => album.length)))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [state.label, tokenChecker]);

    // レーベルのアーティストを取得
    useEffect(() => {
        if (!albumsOfYears.length) return;

        const idSet = new Set<string>();
        albumsOfYears.forEach(albums => {
            albums.forEach(album => {
                album.artists.forEach(artist => idSet.add(artist.id));
            });
        });

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
        if (fav) {
            await deleteUnfavLabelFromFirestore(uid, fav);
            dispatch(setDeleteLabel(state.label));
            setFav(undefined);
        } else {
            const newFavLabel: FavLabel = await addFavLabelToFirestore(uid, state.label);
            dispatch(setAddLabel(newFavLabel));
            setFav(newFavLabel);
        }
    };

    const generateArtists = (artists: Artist[]): JSX.Element => {
        return (
            <AvatarGroup max={6}>
                {artists.map(artist => {
                    return (
                        <Link component={RouterLink} to={{ pathname: `${artistPath}/${artist}`, state: { artist: artist } }}>
                            <Avatar alt={artist.name} src={artist.images[0].url} />
                        </Link>
                    )
                })}
            </AvatarGroup>
        )
    };

    const generateAlbums = (year: Album[]): JSX.Element => {
        const releaseDate: string = year[0].release_date;
        const releaseYear: string = releaseDate.substr(0, 4);
        const albumGridListTiles: JSX.Element[] = year.map(album => {
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
            <Container className={classes.container} id={releaseYear}>
                <Typography className={classes.year}>{releaseYear}</Typography>
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

    return (
        <div className={classes.root}>
            <Typography>{state.label}</Typography>
            <Button onClick={handleFav}>{fav ? 'フォロー中' : 'フォロー'}</Button>
            {artistsOfLabel.length > 0 && generateArtists(artistsOfLabel)}
            {albumsOfYears.map(year => generateAlbums(year))}
        </div>
    )
};

export default withRouter(Label);