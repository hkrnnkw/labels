import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Album } from '../../utils/interfaces';
import {
    GridList, GridListTile, Link, Typography,
} from '@material-ui/core';
import { album as albumPath } from '../../utils/paths';

interface CustomGridListProps {
    albums: Album[],
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {
        backgroundColor: theme.palette.background.default,
    },
    gridList: {
        flexWrap: 'nowrap',
        transform: 'translateZ(0)',
        padding: theme.spacing(2, 4, 0),
        columnGap: theme.spacing(2),
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        '& h6': {
            '&.MuiTypography-root': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            '&.MuiTypography-subtitle1': {
                fontWeight: 700,
                whiteSpace: 'nowrap',
            },
            '&.MuiTypography-subtitle2': {
                display: '-webkit-box',
                lineClamp: 2,
                boxOrient: 'vertical',
                wordBreak: 'break-all',
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

export const CustomGridList: FC<CustomGridListProps> = ({ albums }) => {
    const classes = ambiguousStyles();

    const gridListTiles: JSX.Element[] = albums.map(album => {
        const artistNames: string[] = album.artists.map(artist => artist.name);
        return (
            <GridListTile
                key={`${album.artists[0].name} - ${album.name}`}
                cols={5}
            >
                <Link component={RouterLink} to={{ pathname: `${albumPath}/${album.id}`, state: { album: album } }}>
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
            cols={11}
            spacing={0}
            cellHeight={'auto'}
        >
            {gridListTiles}
        </GridList>
    );
};