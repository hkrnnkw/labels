import React, { FC, useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Snackbar, GridList, GridListTile, GridListTileBar, Container, IconButton, Button,
    Link,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { setHome, setFollowingLabels } from '../stores/albums';
import { setSpotifyTokens } from '../stores/user';
import { Spotify } from '../utils/types';
import { Album } from '../utils/interfaces';
import { album as albumPath, search, label as labelPath } from '../utils/paths';
import { checkTokenExpired, getAlbumsOfLabels, signIn } from '../handlers/spotifyHandler';
import { getListOfFollowingLabelsFromFirestore, setListOfFollowingLabelsToFirestore } from '../handlers/dbHandler';

interface Props extends RouteComponentProps {

}

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

const Home: FC<Props> = () => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [albumsOfLabels, setAlbumsOfLabels] = useState<Album[][]>([]);
    const { signedIn, email, emailVerified, spotify, uid } = useSelector((rootState: RootState) => rootState.user);
    const { home, followingLabels } = useSelector((rootState: RootState) => rootState.albums);

    // レーベルの情報を取得
    const fetchLabels = async () => {
        try {
            // Spotifyトークンの有効期限チェック
            const checkedToken: string | Spotify = await checkTokenExpired({ spotify }, uid);
            if (typeof checkedToken !== 'string') dispatch(setSpotifyTokens(checkedToken));
            const token: string = typeof checkedToken !== 'string' ? checkedToken.spotify.token : checkedToken;

            // Firestoreからフォロー中のレーベル群を取得
            const favLabels = await getListOfFollowingLabelsFromFirestore(uid);
            dispatch(setFollowingLabels(favLabels));

            const defaults = [
                'PAN', 'Warp Records', 'XL Recordings', 'Stones Throw Records', 'Rough Trade', 'Ninja Tune', '4AD',
                'Brainfeeder', 'Dirty Hit', 'AD 93', 'Hyperdub', 'Jagjaguwar', 'Ghostly International', 'Dog Show Records',
                'Because Music', 'Text Records', 'Domino Recording Co', 'Perpetual Novice', 'EQT Recordings',
                'Republic Records', 'Smalltown Supersound', 'aritech',
            ];
            const set = new Set(favLabels.concat(defaults));
            
            // フォロー中のレーベルそれぞれのアルバムを取得
            const results: Album[][] = await getAlbumsOfLabels(favLabels.length > 3 ? favLabels : Array.from(set), true, token);
            setAlbumsOfLabels(results);
            dispatch(setHome(results));
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };
    useEffect(() => {
        if (signedIn) {
            if (!emailVerified) sendEmailVerification();
            home.length ? setAlbumsOfLabels(home) : fetchLabels().catch(err => console.log(err));
        } else {
            setAlbumsOfLabels([]);
        }
    }, [signedIn]);

    // TODO 確認メール送信
    const sendEmailVerification = () => {

        setSnackbarOpen(true);
    };

    // スナックバーを閉じる
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // フォロー操作
    const handleFollowing = async (labelName: string) => {
        await setListOfFollowingLabelsToFirestore(uid, labelName);
        dispatch(setFollowingLabels(labelName));
    };

    const generateAlbums = (label: Album[], list: string[]): JSX.Element => {
        const labelName: string = label[0].label;
        const albumGridListTiles: JSX.Element[] = label.map(album => {
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
            <Container className={classes.container} id={labelName}>
                <Link
                    component={RouterLink}
                    to={{ pathname: `${labelPath}/${labelName}`, state: { label: labelName } }}
                    className={classes.labelName}
                >
                    {labelName}
                </Link>
                {!list.includes(labelName) &&
                    <Button onClick={() => handleFollowing(labelName)}>フォロー</Button>
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

    const privateHome = (labels: Album[][], list: string[]): JSX.Element => {
        return (
            <div className={classes.root}>
                <Link component={RouterLink} to={search}><IconButton><SearchIcon /></IconButton></Link>
                {labels.map(label => generateAlbums(label, list))}
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={snackbarOpen}
                    onClose={handleSnackbarClose}
                    message={`${email}に確認メールを送信しました`}
                />
            </div>
        )
    };

    const guestHome = (): JSX.Element => {
        return (
            <div className={classes.root}>
                <Button onClick={signIn}>はじめる</Button>
            </div>
        )
    };

    return signedIn ? privateHome(albumsOfLabels, followingLabels) : guestHome();
};

export default withRouter(Home);