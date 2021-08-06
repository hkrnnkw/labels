import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, List, ListItem, ListItemText, Container,
} from '@material-ui/core';
import { Props, Album, Artist as ArtistObj } from '../utils/interfaces';
import { Year } from '../utils/types';
import { getArtistAlbums } from '../handlers/spotifyHandler';
import { ContainerOfYears } from './custom/ContainerOfYears';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '52px',
    },
    container: {
        width: `calc(100vw - ${theme.spacing(8)}px)`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        overflow: 'hidden',
        padding: 0,
        margin: theme.spacing(0, 4, 6),
        '& img': {
            width: '100%',
            height: 'auto',
            margin: theme.spacing(2, 0),
        },
        '& p': {
            width: '100%',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: theme.palette.text.secondary,
            wordBreak: 'break-all',
            padding: theme.spacing(2, 0, 1),
        },
        '& ul#genres': {
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            flexDirection: 'row',
            flexWrap: 'wrap',
            margin: theme.spacing(3, 0),
            padding: 0,
            '& li': {
                width: 'fit-content',
                height: '28px',
                borderRadius: '14px',
                padding: theme.spacing(3),
                margin: theme.spacing(1, 2, 1, 0),
                color: theme.palette.background.default,
                backgroundColor: theme.palette.text.secondary,
                '& .MuiListItemText-root': {
                    margin: 0,
                    '& span': {
                        fontSize: '0.875rem',
                        lineHeight: '1.6rem',
                    },
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

const Artist: FC<Props> = ({ tokenChecker }) => {
    const classes = ambiguousStyles();
    const { state } = useLocation<{ artist: ArtistObj }>();
    const { id: artistId, name: artistName, genres, images } = state.artist;
    const [albumsOfYears, setAlbumsOfYears] = useState<Year>({});

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = artistName;
    }, [artistName]);

    useEffect(() => {
        const fetchAlbums = async (): Promise<Year> => {
            const token: string = await tokenChecker();
            const albums: Album[] = await getArtistAlbums(artistId, token);
            const yearObj: Year = {};
            for (const album of albums) {
                const yearKey: string = album.release_date.split('-')[0];
                const releasesOfYear: Album[] = yearObj[yearKey] || [];
                releasesOfYear.push(album);
                yearObj[yearKey] = releasesOfYear;
            };
            return yearObj;
        }
        fetchAlbums()
            .then(results => setAlbumsOfYears(results))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [artistId, tokenChecker]);

    return (
        <div className={classes.contentClass}>
            <Container className={classes.container}>
                <img
                    src={images[0].url}
                    alt={artistName}
                />
                <Typography>{artistName}</Typography>
                {genres.length > 0 &&
                    <List id='genres'>
                        {genres.map(genre => (
                            <ListItem><ListItemText>{genre}</ListItemText></ListItem>
                        ))}
                    </List>
                }
            </Container>
            <ContainerOfYears years={albumsOfYears} tokenChecker={tokenChecker} />
        </div>
    )
};

export default withRouter(Artist);