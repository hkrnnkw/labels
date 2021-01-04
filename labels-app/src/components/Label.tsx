import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Link, Button, Container, GridList, GridListTile, GridListTileBar, Avatar,
} from '@material-ui/core';
import { Spotify } from '../utils/types';
import { Album, Artist } from '../utils/interfaces';
import { album as albumPath, artist } from '../utils/paths';
import { setFollowingLabels } from '../stores/albums';
import { setSpotifyTokens } from '../stores/user';
import { checkTokenExpired, searchAlbums } from '../handlers/spotifyHandler';
import { addFollowingLabelToFirestore, deleteFollowedLabelFromFirestore } from '../handlers/dbHandler';

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

const Label: FC = () => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { state } = useLocation<{ label: string }>();
    const { spotify, uid } = useSelector((rootState: RootState) => rootState.user);
    const { followingLabels: labels } = useSelector((rootState: RootState) => rootState.albums);
    const already: boolean = labels.includes(state.label);
    const [following, setFollowing] = useState<boolean>(already);
    const [albumsOfYears, setAlbumsOfYears] = useState<Album[][]>([]);

    // レーベルの情報を取得
    useEffect(() => {
        const fetchLabel = async (): Promise<Album[][]> => {
            const checkedToken: string | Spotify = await checkTokenExpired({ spotify }, uid);
            if (typeof checkedToken !== 'string') dispatch(setSpotifyTokens(checkedToken));
            const token: string = typeof checkedToken !== 'string' ? checkedToken.spotify.token : checkedToken;
            
            const today = new Date();
            const thisYear = today.getFullYear();
            const last5years: number[] = new Array(5).fill(thisYear).map((y, i) => y - i);
            const tasks = last5years.map(year => searchAlbums({ label: state.label, year: year }, token));
            return await Promise.all(tasks);
        };
        fetchLabel()
            .then(albums => setAlbumsOfYears(albums.filter(album => album.length)))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [state.label, spotify, uid, dispatch]);

    // フォロー操作
    const handleFollowing = async () => {
        following ? await deleteFollowedLabelFromFirestore(uid, state.label) :
            await addFollowingLabelToFirestore(uid, state.label);
        dispatch(setFollowingLabels(state.label));
        setFollowing(!following);
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
            <Button onClick={handleFollowing}>{following ? 'フォロー中' : 'フォロー'}</Button>
            {/* TODO アーティストを取得・表示 */}
            {albumsOfYears.map(year => generateAlbums(year))}
        </div>
    )
};

export default withRouter(Label);