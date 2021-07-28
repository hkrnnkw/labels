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
import { Props, Album as AlbumObj, Artist } from '../utils/interfaces';
import { artist as artistPath, label as labelPath } from '../utils/paths';
import { checkIsAlbumsInUserLibrary, convertReleaseDate, getArtists, isVariousAritist,
    saveOrRemoveAlbumsForCurrentUser,
} from '../handlers/spotifyHandler';
import { FollowButton } from './custom/FollowButton';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '64px',
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
        margin: theme.spacing(0, 4, 6),
    },
    labelName: {
        width: `calc(100vw - ${theme.spacing(30)}px)`,
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
    const { state } = useLocation<{ album: AlbumObj }>();
    const { id, artists: simpleArtists, images, name: title, label: labelName, tracks, release_date } = state.album;
    const [fullArtists, setFullArtists] = useState<Artist[]>([]);
    const [isSaved, setIsSaved] = useState<boolean>();
    const isVA: boolean = simpleArtists.length === 1 && isVariousAritist(simpleArtists[0].name);
    const VARIOUS_ARTISTS: string = 'Various Artists';
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);

    useEffect(() => {
        document.title = title;
    }, [title]);

    // ユーザライブラリに保存されているかチェック
    useEffect(() => {
        const initSavedStatus = async (): Promise<boolean> => {
            const token: string = await tokenChecker();
            const result: boolean[] = await checkIsAlbumsInUserLibrary([id], token);
            return result[0];
        };
        initSavedStatus()
            .then(res => setIsSaved(res))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [id, tokenChecker]);

    // アーティストの情報を取得
    useEffect(() => {
        const artistIds: string[] = isVA ?
            tracks.items.flatMap(item => item.artists.map(artist => artist.id))
            :
            simpleArtists.map(artist => artist.id);

        const fetchArtists = async (): Promise<Artist[]> => {
            const token: string = await tokenChecker();
            return await getArtists(artistIds, token);
        };
        fetchArtists()
            .then(artists => setFullArtists(artists))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [isVA, tracks.items, simpleArtists, tokenChecker]);

    // アーティスト名を並べる
    const createArtistNames = (artists: Artist[], lowerSide: boolean = false): JSX.Element[] => {
        // Various Artistsの場合
        if (isVA && !lowerSide) return [<Typography variant='subtitle2'>{VARIOUS_ARTISTS}</Typography>];

        if (lowerSide || artists.length === 1) {
            return artists.map(artist => (
                <ListItem id={lowerSide ? undefined : 'higherSide'}>
                    <Link
                        component={RouterLink}
                        to={{ pathname: `${artistPath}/${artist.id}`, state: { artist: artist } }}
                    >
                        <Avatar alt={artist.name} src={artist.images[0]?.url || ''} />
                        <ListItemText>{artist.name}</ListItemText>
                    </Link>
                </ListItem>
            ));
        }
        else {
            const artistNames: string[] = artists.map(artist => artist.name);
            return [<Typography variant='subtitle2'>{artistNames.join(', ')}</Typography>];
        }
    };
    
    const handleClose = (event: MouseEvent | SyntheticEvent<Element, Event>, reason: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // アルバム保存／削除処理
    const operateUserLibrary = async () => {
        if (isSaved === undefined) return;
        const temp: boolean = isSaved;
        setIsSaved(!isSaved);
        if (!temp) setSnackbarOpen(true);
        const token: string = await tokenChecker();
        await saveOrRemoveAlbumsForCurrentUser([id], temp, token);
    };

    return (
        <div className={classes.contentClass}>
            <Container className={classes.container}>
                <Link
                    className={classes.labelName}
                    component={RouterLink}
                    to={{ pathname: `${labelPath}/${labelName}`, state: { labelName: labelName } }}
                >
                    {labelName}
                </Link>
                <FollowButton labelName={labelName} tokenChecker={tokenChecker} />
                <img
                    src={images[0].url}
                    alt={`${simpleArtists[0].name} - ${title}`}
                    className={classes.jacket}
                />
                <span className={classes.title}>
                    <Typography>{title}</Typography>
                    <IconButton onClick={operateUserLibrary} disabled={isSaved === undefined}>
                        {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                </span>
                <div className={classes.artist}>{createArtistNames(fullArtists)}</div>
                <List className={classes.tracks}>
                    {tracks.items.map(track =>
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