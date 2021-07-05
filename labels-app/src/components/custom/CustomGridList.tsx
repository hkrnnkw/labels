import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Album } from '../../utils/interfaces';
import {
    GridList, GridListTile, GridListTileBar, Link,
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

export const CustomGridList: FC<CustomGridListProps> = ({ albums }) => {
    const classes = ambiguousStyles();

    const gridListTiles: JSX.Element[] = albums.map(album => (
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
    ));

    return (
        <GridList
            className={classes.gridList}
            cols={5}
            spacing={8}
        >
            {gridListTiles}
        </GridList>
    );
};