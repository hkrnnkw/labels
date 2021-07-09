import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { auth } from '../../firebase';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, Button, ListItem, ListItemText, Avatar, IconButton,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';

interface SignOutDrawerProps {
    displayName: string,
    photoURL: string | null,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {
        backgroundColor: theme.palette.background.default,
    },
    openButton: {
        width: '100vw',
        '& .MuiButton-label': {
            justifyContent: 'flex-start',
            textTransform: 'none',
        },
    },
    cancelButton: {
        width: '100vw',
        height: '7.5vh',
        '& .MuiButton-label': {
            textTransform: 'none',
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

export const SignOutDrawer: FC<SignOutDrawerProps> = ({ displayName, photoURL }) => {
    const classes = ambiguousStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const signOut = async () => {
        await auth.signOut();
        setDrawerOpen(false);
    }

    return (
        <div>
            {!photoURL ?
                <IconButton className={classes.openButton} onClick={toggleDrawer(true)}>
                    <PersonIcon />
                </IconButton>
                :
                <Button className={classes.openButton} onClick={toggleDrawer(true)}>
                    <Avatar alt={displayName} src={photoURL} />
                </Button>
            }
            <SwipeableDrawer
                anchor={'bottom'}
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
            >
                <div
                    role="presentation"
                >
                    <List>
                        <ListItem button onClick={signOut}><ListItemText primary={'Sign out'} /></ListItem>
                    </List>
                    <Button
                        className={classes.cancelButton}
                        onClick={toggleDrawer(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </SwipeableDrawer>
        </div>
    )
};