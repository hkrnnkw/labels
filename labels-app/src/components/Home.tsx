import React, { FC, useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import firebase, { f } from '../firebase';
import { RootState } from '../stores/index';
import {
    createStyles, makeStyles, Snackbar, GridList, GridListTile, GridListTileBar, Container,
    Typography, IconButton,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Album, Image, Artist } from '../utils/types';
import { search } from '../utils/paths';
import axios from 'axios';

interface GetAlbumsOfLabelsResponse extends firebase.functions.HttpsCallableResult {
    readonly data: Album[][];
}

interface Props extends RouteComponentProps {

}

const ambiguousStyles = makeStyles(() =>
    createStyles({
        contentClass: {
            minHeight: '100vh',
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
        '@media (min-width: 960px)': {
            contentClass: {
                display: 'flex',
            },
        },
    }),
);

const Home: FC<Props> = () => {
    const classes = ambiguousStyles();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [albumsOfLabels, setAlbumsOfLabels] = useState<Album[][]>([]);
    const { signedIn, email, emailVerified, spotify } = useSelector((rootState: RootState) => rootState.user);

    // レーベルの情報を取得
    const fetchLabels = async () => {
        try {
            if (!spotify.token) {
                const labels = [
                    'PAN', 'Warp Records', 'XL Recordings', 'Stones Throw Records', 'Rough Trade', 'Ninja Tune', '4AD',
                    'Brainfeeder', 'Dirty Hit', 'AD 93', 'Hyperdub', 'Jagjaguwar', 'Ghostly International', 'Dog Show Records',
                    'Because Music', 'Text Records', 'Domino Recording Co', 'Perpetual Novice', 'EQT Recordings',
                    'Republic Records', 'Smalltown Supersound', 'aritech',
                ];
                const getAlbumsOfLabels: firebase.functions.HttpsCallable = f.httpsCallable('spotify_getAlbumsOfLabels');
                const res: GetAlbumsOfLabelsResponse = await getAlbumsOfLabels({ labels: labels });
                setAlbumsOfLabels(res.data);
                return;
            }

        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };
    useEffect(() => {
        if (signedIn && !emailVerified) sendEmailVerification();
        fetchLabels().catch(err => console.log(err));
    }, []);

    // TODO 確認メール送信
    const sendEmailVerification = () => {

        setSnackbarOpen(true);
    };

    // スナックバーを閉じる
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const generateAlbums = (label: Album[]): JSX.Element => {
        const labelName: string = label[0].label;
        const albumGridListTiles: JSX.Element[] = label.map(album => {
            const img = album.images[0] as Image;
            const artists = album.artists as Artist[];
            return <GridListTile key={`${artists[0].name} - ${album.name}`}>
                <img src={img.url} alt={`${artists[0].name} - ${album.name}`} />
                <GridListTileBar
                    title={album.name}
                    subtitle={artists[0].name}
                    classes={{
                        root: classes.titleBar,
                        title: classes.title,
                    }}
                />
            </GridListTile>;
        });
        return <Container className={classes.container} id={labelName}>
            <Typography className={classes.labelName}>{labelName}</Typography>
            <GridList className={classes.gridList}>
                {albumGridListTiles}
            </GridList>
        </Container>;
    };

    return (
        <div>
            <Link to={search}><IconButton><SearchIcon /></IconButton></Link>
            {albumsOfLabels.length > 0 &&
                albumsOfLabels.map(label => generateAlbums(label))
            }
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                message={`${email}に確認メールを送信しました`}
            />
        </div>
    )
};

export default withRouter(Home);