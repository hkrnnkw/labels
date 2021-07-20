import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Avatar, List, ListItem, ListItemText, Link, Container,
} from '@material-ui/core';
import { Props, Album as AlbumObj, Artist } from '../utils/interfaces';
import { artist as artistPath, label as labelPath } from '../utils/paths';
import { convertReleaseDate, getArtists, isVariousAritist } from '../handlers/spotifyHandler';
import { FollowButton } from './custom/FollowButton';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '48px',
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
        width: `calc(100vw - ${theme.spacing(30)}px)`,
        fontSize: '1.6rem',
        padding: theme.spacing(2, 0),
        margin: theme.spacing(0, 2, 0, 0),
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        alignItems: 'center',
    },
    title: {
        width: '100%',
        margin: theme.spacing(2, 0, 1),
        fontSize: '1.2rem',
        fontWeight: 700,
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
        '& li': {
            padding: theme.spacing(1, 0),
            '& a.MuiLink-root': {
                display: 'flex',
                alignItems: 'center',
                '& .MuiAvatar-root': {
                    marginRight: theme.spacing(3),
                },
                '&#higherSide': {
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
    },
    tracks: {
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        margin: theme.spacing(3, 0),
        padding: 0,
        '& li': {
            padding: theme.spacing(0),
            '& .MuiListItemText-root': {
                margin: 0,
                '& span': {
                    fontSize: '0.875rem',
                    lineHeight: '1.6rem',
                },
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
    const { artists: simpleArtists, images, name: title, label: labelName, tracks, release_date } = state.album;
    const [fullArtists, setFullArtists] = useState<Artist[]>([]);
    const isVA: boolean = simpleArtists.length === 1 && isVariousAritist(simpleArtists[0].name);
    const VARIOUS_ARTISTS: string = 'Various Artists';

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
                <ListItem>
                    <Link
                        component={RouterLink}
                        to={{ pathname: `${artistPath}/${artist.id}`, state: { artist: artist } }}
                        id={lowerSide ? undefined : 'higherSide'}
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
                <Typography className={classes.title}>{title}</Typography>
                <div className={classes.artist}>{createArtistNames(fullArtists)}</div>
                <List className={classes.tracks}>
                    {tracks.items.map(track =>
                        <ListItem><ListItemText>{track.name}</ListItemText></ListItem>)}
                </List>
                <Typography>{convertReleaseDate(release_date)}</Typography>
                <List className={classes.artist}>{createArtistNames(fullArtists, true)}</List>
            </Container>
        </div>
    )
};

export default withRouter(Album);