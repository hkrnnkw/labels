import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Drawer, List, IconButton, ListItem, ListItemText, Link, Avatar, Button,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { AvatarGroup } from '@material-ui/lab';
import { Artist } from '../../utils/interfaces';
import { artist as artistPath } from '../../utils/paths';

interface AvatarsDrawerProps {
    artists: Artist[],
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        margin: theme.spacing(2, 0, 2, 1),
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        '& div.MuiAvatarGroup-root': {
            width: 'max-content',
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
        width: '36px',
        height: '40px',
        position: 'absolute',
        right: '-4px',
        padding: 0,
    },
    paper: {
        height: `calc(100% - 98px)`,
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        zIndex: 1301,
        border: 'none',
        '& .MuiTypography-colorTextSecondary': {
            color: theme.palette.text.secondary,
            fontSize: '0.8rem',
            fontWeight: 700,
        },
    },
    artist: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        height: '100vh',
        display: 'block',
        margin: theme.spacing(0, 4),
        paddingTop: theme.spacing(2),
        '& li': {
            height: '40px',
            display: 'inline-block',
            padding: 0,
            margin: theme.spacing(0, 0, 4),
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
        width: '88px',
        height: '88px',
        color: theme.palette.background.default,
        position: 'fixed',
        top: '98px',
        right: 0,
        margin: 0,
        padding: 0,
        borderBottom: `88px solid transparent`,
        borderRight: `88px solid ${theme.palette.secondary.main}`,
        borderRadius: 0,
        zIndex: 1302,
        '& span.MuiButton-label': {
            width: '20px',
            height: '20px',
            position: 'absolute',
            top: '16px',
            left: '52px',
        },
    },
    '@media (min-width: 960px)': {

    },
}));

export const AvatarsDrawer: FC<AvatarsDrawerProps> = ({ artists }) => {
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
            <Drawer
                anchor={'bottom'}
                variant='persistent'
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                classes={{ paper: classes.paper }}
            >
                <div role='presentation'>
                    <Button className={classes.cancelButton} onClick={toggleDrawer(false)}>
                        <ClearIcon fontSize='small' />
                    </Button>
                    <List className={classes.artist}>
                        {generateAvatars(true)}
                    </List>
                </div>
            </Drawer>
        </div>
    );
};