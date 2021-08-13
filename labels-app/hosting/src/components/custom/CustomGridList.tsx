import React, { FC, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Album, CustomAlbum } from '../../utils/interfaces';
import {
    GridList, GridListTile, Link, Typography,
} from '@material-ui/core';
import { paths } from '../../utils/paths';
import { createCustomAlbum } from '../../handlers/spotifyHandler';

interface CustomGridListProps {
    albums: Album[],
    tokenChecker: () => Promise<string>,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    gridList: {
        whiteSpace: 'nowrap',
        display: 'block',
        transform: 'translateZ(0)',
        padding: theme.spacing(2, 4, 0),
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        '& li.MuiGridListTile-root': {
            display: 'inline-block',
        },
        '& h6': {
            '&.MuiTypography-root': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            '&.MuiTypography-subtitle1': {
                fontWeight: 700,
                whiteSpace: 'nowrap',
                color: theme.palette.primary.main,
            },
            '&.MuiTypography-subtitle2': {
                display: '-webkit-box',
                lineClamp: 2,
                boxOrient: 'vertical',
                wordBreak: 'break-all',
                color: theme.palette.text.secondary,
            },
        },
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

export const CustomGridList: FC<CustomGridListProps> = ({ albums, tokenChecker }) => {
    const classes = ambiguousStyles();
    const [customAlbums, setCustomAlbums] = useState<CustomAlbum[]>([]);

    useEffect(() => {
        // リリース日で降順ソート
        const sortByReleaseDate = (rawList: CustomAlbum[]): CustomAlbum[] => {
            const arrayForSort: CustomAlbum[] = [...rawList];
            return arrayForSort.sort((a: CustomAlbum, b: CustomAlbum) => {
                const aDate = a.release_date, bDate = b.release_date;
                return (aDate > bDate ? -1 : aDate < bDate ? 1 : 0);
            });
        };

        const init = async (): Promise<CustomAlbum[]> => {
            const token: string = await tokenChecker();
            const _customAlbums = await createCustomAlbum(albums, token);
            return sortByReleaseDate(_customAlbums);
        };
        init()
            .then(res => setCustomAlbums(res))
            .catch(err => console.error(err));
    }, [albums, tokenChecker]);

    // アルバム一覧を形成
    const createGridListTile = (_albums: CustomAlbum[]): JSX.Element[] => _albums.map(album => {
        const artistNames: string[] = album.artists.map(artist => artist.name);
        return (
            <GridListTile
                key={`${album.artists[0].name} - ${album.name}`}
                cols={5}
            >
                <Link component={RouterLink} to={{ pathname: `${paths.album}/${album.variants[0].saved.albumId}`, state: { album: album } }}>
                    <img
                        src={album.images[0].url}
                        alt={`${album.artists[0].name} - ${album.name}`}
                        className={classes.jacket}
                    />
                    <Typography variant='subtitle1'>{album.name}</Typography>
                    <Typography variant='subtitle2'>{artistNames.join(', ')}</Typography>
                </Link>
            </GridListTile>
        )
    });

    return (
        <GridList
            className={classes.gridList}
            cols={12}
            spacing={12}
            cellHeight={'auto'}
        >
            {createGridListTile(customAlbums)}
        </GridList>
    );
};