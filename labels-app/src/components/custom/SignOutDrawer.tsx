import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../../firebase';
import { setClearUser } from '../../stores/user';
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
    paper: {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        '& #signOut': {
            color: theme.palette.error.light,
        },
    },
    openButton: {
        display: 'flex',
        minWidth: '36px',
        padding: theme.spacing(1.5, 0),
        margin: theme.spacing(0, 4),
        '& .MuiButton-label': {
            justifyContent: 'flex-start',
        },
    },
    icon: {
        width: '36px',
        height: '36px',
    },
    cancelButton: {
        width: '100vw',
        height: '7.5vh',
        color: theme.palette.text.secondary,
    },
    '@media (min-width: 960px)': {

    },
}));

export const SignOutDrawer: FC<SignOutDrawerProps> = ({ displayName, photoURL }) => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const signOut = async () => {
        dispatch(setClearUser());
        await auth.signOut();
        setDrawerOpen(false);
    }

    return (
        <div>
            {!photoURL ?
                <IconButton className={classes.openButton} onClick={toggleDrawer(true)}>
                    <PersonIcon className={classes.icon} />
                </IconButton>
                :
                <Button className={classes.openButton} onClick={toggleDrawer(true)}>
                    <Avatar alt={displayName} src={photoURL} className={classes.icon} />
                </Button>
            }
            <SwipeableDrawer
                anchor={'bottom'}
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
                classes={{ paper: classes.paper }}
            >
                <div
                    role="presentation"
                >
                    <List>
                        <ListItem button onClick={signOut}>
                            <ListItemText primary={'Sign out'} id={'signOut'}/>
                        </ListItem>
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