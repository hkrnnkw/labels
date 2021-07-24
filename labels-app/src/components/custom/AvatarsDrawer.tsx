import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, IconButton, ListItem, ListItemText, Link, Avatar,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { AvatarGroup } from '@material-ui/lab';
import { Artist } from '../../utils/interfaces';
import { artist as artistPath } from '../../utils/paths';

interface AvatarsDrawerProps {
    artists: Artist[],
    labelName: string,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: `calc(100% - ${theme.spacing(20)}px)`,
        margin: theme.spacing(2, 0, 2, 1),
        display: 'flex',
        position: 'relative',
        '& div.MuiAvatarGroup-root': {
            '& .MuiAvatarGroup-avatar': {
                border: 'none',
                margin: theme.spacing(0, 0, 0, -1),
            },
            '& div.MuiAvatarGroup-avatar': {
                color: theme.palette.text.primary,
                backgroundColor: 'transparent',
                fontSize: '0.8rem',
                fontWeight: 700,
                pointerEvents: 'none',
            },
        },
    },
    openButton: {
        width: '40px',
        height: '40px',
        position: 'absolute',
        right: 2,
        padding: 0,
    },
    paper: {
        height: `calc(100vh - ${theme.spacing(19)}px)`,
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        borderRadius: '16px 16px 0 0',
        '& .MuiTypography-colorTextSecondary': {
            color: theme.palette.text.secondary,
            fontSize: '0.8rem',
            fontWeight: 700,
        },
    },
    artist: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        margin: theme.spacing(0, 4),
        paddingTop: theme.spacing(3),
        '& li': {
            padding: theme.spacing(1, 0),
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            '& a.MuiLink-root': {
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.text.primary,
                '& .MuiAvatar-root': {
                    marginRight: theme.spacing(3),
                },
            },
        },
    },
    cancelButton: {
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
        position: 'fixed',
        top: 0,
        right: 0,
        margin: theme.spacing(4),
    },
    '@media (min-width: 960px)': {

    },
}));

export const AvatarsDrawer: FC<AvatarsDrawerProps> = ({ artists, labelName }) => {
    const classes = ambiguousStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const generateAvatars = (onDrawer: boolean) => {
        if (onDrawer) {
            return artists.map(artist => (
                <ListItem>
                    <Link component={RouterLink} to={{ pathname: `${artistPath}/${artist}`, state: { artist: artist } }}>
                        <Avatar alt={artist.name} src={artist.images[0]?.url || ''} />
                        <ListItemText primary={artist.name} />
                    </Link>
                </ListItem>
            ));
        }
        return artists.map(artist => (
            <Link component={RouterLink} to={{ pathname: `${artistPath}/${artist}`, state: { artist: artist } }}>
                <Avatar alt={artist.name} src={artist.images[0]?.url || ''} />
            </Link>
        ));
    };

    return (
        <div className={classes.contentClass}>
            <AvatarGroup max={7}>{generateAvatars(false)}</AvatarGroup>
            <IconButton
                className={classes.openButton}
                onClick={toggleDrawer(true)}
            />
            <SwipeableDrawer
                anchor={'bottom'}
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
                classes={{ paper: classes.paper }}
            >
                <div role='presentation'>
                    <IconButton className={classes.cancelButton} onClick={toggleDrawer(false)}>
                        <ClearIcon fontSize='small' />
                    </IconButton>
                    <List className={classes.artist}>
                        <ListItem><ListItemText secondary={`Artists of ${labelName}`} /></ListItem>
                        {generateAvatars(true)}
                    </List>
                </div>
            </SwipeableDrawer>
        </div>
    );
};