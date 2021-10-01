import React, { FC, SyntheticEvent, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Avatar, List, ListItem, ListItemText, Link, Container, IconButton,
    Snackbar,
} from '@material-ui/core';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CloseIcon from '@material-ui/icons/Close';
import { Props, Artist, CustomAlbum } from '../utils/interfaces';
import { paths } from '../utils/paths';
import {
    convertReleaseDate, getArtists, isVariousAritist, saveAlbumsToUserLibrary, removeAlbumsFromUserLibrary,
} from '../handlers/spotifyHandler';
import { FollowButton } from './custom/FollowButton';
import { LabelsDrawer } from './custom/LabelsDrawer';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '52px',
        '& .MuiTypography-subtitle2': {
            color: theme.palette.text.secondary,
        },
    },
    jacket: {
        width: '100%',
        height: 'auto',
        margin: theme.spacing(2, 0),
    },
    container: {
        width: `calc(100vw - ${theme.spacing(8)}px)`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        padding: 0,
        margin: theme.spacing(2, 4, 6),
    },
    labelName: {
        width: `calc(100% - 90px)`,
        height: '32px',
        fontSize: '1.6rem',
        lineHeight: 1.2,
        letterSpacing: '0.00938em',
        padding: theme.spacing(2, 0),
        margin: theme.spacing(0, 2, 0, 0),
        display: 'inline',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    title: {
        width: '100%',
        display: 'inline-flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        '& p': {
            width: `calc(100% - ${theme.spacing(12)}px)`,
            margin: theme.spacing(2, 0),
            fontSize: '1.2rem',
            fontWeight: 700,
            color: theme.palette.text.secondary,
        },
        '& button': {
            color: theme.palette.secondary.main,
            padding: theme.spacing(2.5, 3),
        },
    },
    artist: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        '&.MuiList-root': {
            alignItems: 'flex-start',
            flexDirection: 'column',
            flexWrap: 'nowrap',
        },
        '& .MuiTypography-root': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        '& li': {
            padding: theme.spacing(4, 0, 0),
            '& a.MuiLink-root': {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.text.primary,
                '& .MuiAvatar-root': {
                    marginRight: theme.spacing(3),
                },
                '& .MuiAvatar-colorDefault': {
                    backgroundColor: theme.palette.secondary.main,
                },
            },
            '&#higherSide': {
                padding: theme.spacing(0),
                '& .MuiAvatar-root': {
                    width: '24px',
                    height: '24px',
                    marginRight: theme.spacing(2),
                },
                '& .MuiListItemText-root': {
                    '& span': {
                        fontSize: '0.875rem',
                    },
                },
            },
        },
    },
    tracks: {
        color: theme.palette.text.secondary,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        margin: theme.spacing(4, 0),
        padding: 0,
        '& li': {
            padding: theme.spacing(0),
            '& .MuiListItemText-root': {
                margin: 0,
                '& span': {
                    fontSize: '1.0rem',
                    lineHeight: '1.8rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                },
            },
        },
    },
    snackbar: {
        '& .MuiSnackbarContent-root': {
            color: theme.palette.background.default,
            background: theme.palette.secondary.main,
            '& button': {
                color: theme.palette.background.default,
            },
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Album: FC<Props> = ({ tokenChecker }) => {
    const classes = ambiguousStyles();
    const { state } = useLocation<{ album: CustomAlbum }>();
    const { artists: simpleArtists, images, name: title, variants, tracks, release_date } = state.album;
    const labelNames = Array.from(new Set<string>(variants.map(v => v.labelName)));
    const [fullArtists, setFullArtists] = useState<Artist[]>([]);

    // アルバムがSpotifyライブラリに保存されているか
    const [isSaved, setIsSaved] = useState<boolean>(variants.find(v => v.saved.inLib === true) !== undefined);

    const isVA: boolean = simpleArtists.length === 1 && isVariousAritist(simpleArtists[0].name);
    const VARIOUS_ARTISTS: string = 'Various Artists';
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = title;
    }, [title]);

    // アーティストの情報を取得
    useEffect(() => {
        // Various Artistsなら、楽曲情報からアーティストを取得
        const tempArtistIds: string[] = isVA ?
            tracks.flatMap(track => track.artists.map(artist => artist.id))
            :
            simpleArtists.map(artist => artist.id);
        const artistIds = Array.from(new Set<string>(tempArtistIds));

        const fetchArtists = async (): Promise<Artist[]> => {
            const token: string = await tokenChecker();
            return await getArtists(artistIds, token);
        };
        fetchArtists()
            .then(artists => setFullArtists(artists))
            .catch(err => console.error(`Spotify fetching error: ${err}`));
    }, [isVA, tracks, simpleArtists, tokenChecker]);

    // アーティスト名を並べる
    const createArtistNames = (artists: Artist[], lowerSide: boolean = false): JSX.Element[] => {
        // Various Artistsの場合
        if (isVA && !lowerSide) return [<Typography variant='subtitle2'>{VARIOUS_ARTISTS}</Typography>];

        // ページ下部にアーティスト名を並べる or アーティストが1人
        if (lowerSide || artists.length === 1) {
            return artists.map(artist => (
                <ListItem id={lowerSide ? undefined : 'higherSide'}>
                    <Link
                        component={RouterLink}
                        to={{ pathname: `${paths.artist}/${artist.id}`, state: { artist: artist } }}
                    >
                        <Avatar alt={artist.name} src={artist.images[0]?.url || ''} />
                        <ListItemText>{artist.name}</ListItemText>
                    </Link>
                </ListItem>
            ));
        }
        // ページ上部に複数のアーティスト名を並べる
        else {
            const artistNames: string[] = artists.map(artist => artist.name);
            return [<Typography variant='subtitle2'>{artistNames.join(', ')}</Typography>];
        }
    };
    
    // スナックバーを閉じる
    const handleClose = (event: MouseEvent | SyntheticEvent<Element, Event>, reason: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // アルバム保存／削除処理
    const operateUserLibrary = async () => {
        const token: string = await tokenChecker();
        // すでにライブラリに保存されていたら、取り除く
        if (isSaved) {
            const ids: string[] = variants.flatMap(v => v.saved.inLib ? v.saved.albumId : []);
            if (!ids.length) return;
            await removeAlbumsFromUserLibrary(ids, token);
        }
        // ライブラリに保存されていなかったら、保存する
        else {
            setSnackbarOpen(true);
            await saveAlbumsToUserLibrary([variants[0].saved.albumId], token);
        }
        setIsSaved(!isSaved);
    };

    return (
        <div className={classes.contentClass}>
            <Container className={classes.container}>
                {labelNames.length > 1 ?
                    <LabelsDrawer labelNames={labelNames} tokenChecker={tokenChecker} />
                    :
                    <>
                        <Link
                            className={classes.labelName}
                            component={RouterLink}
                            to={{ pathname: `${paths.label}/${variants[0].labelName}`, state: { labelName: variants[0].labelName } }}
                        >
                            {variants[0].labelName}
                        </Link>
                        <FollowButton labelName={variants[0].labelName} tokenChecker={tokenChecker} />
                    </>
                }
                <img
                    src={images[0].url}
                    alt={`${simpleArtists[0].name} - ${title}`}
                    className={classes.jacket}
                />
                <span className={classes.title}>
                    <Typography>{title}</Typography>
                    <IconButton onClick={operateUserLibrary}>
                        {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                </span>
                <div className={classes.artist}>{createArtistNames(fullArtists)}</div>
                <List className={classes.tracks}>
                    {tracks.map(track =>
                        <ListItem><ListItemText>{track.name}</ListItemText></ListItem>)}
                </List>
                <Typography variant='subtitle2'>{convertReleaseDate(release_date)}</Typography>
                <List className={classes.artist}>{createArtistNames(fullArtists, true)}</List>
            </Container>
            <Snackbar
                className={classes.snackbar}
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleClose}
                message='Saved this album to your library on Spotify.'
                action={
                    <IconButton size='small' onClick={e => handleClose(e, 'click')}>
                        <CloseIcon fontSize='small' />
                    </IconButton>
                }
            />
        </div>
    )
};

export default withRouter(Album);