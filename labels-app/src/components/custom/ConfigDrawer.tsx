import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { auth } from '../../firebase';
import { setClearUser } from '../../stores/user';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, Button, ListItem, ListItemText, Avatar, IconButton,
    Link,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { paths } from '../../utils/paths';

interface ConfigDrawerProps {
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
        color: theme.palette.secondary.main,
        display: 'flex',
        padding: theme.spacing(1, 0),
        margin: theme.spacing(0, 4),
        '& .MuiButton-label': {
            justifyContent: 'flex-start',
        },
    },
    icon: {
        width: '28px',
        height: '28px',
    },
    cancelButton: {
        width: '100vw',
        height: '7.5vh',
        color: theme.palette.text.secondary,
    },
    '@media (min-width: 960px)': {

    },
}));

export const ConfigDrawer: FC<ConfigDrawerProps> = ({ displayName, photoURL }) => {
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
            <IconButton className={classes.openButton} onClick={toggleDrawer(true)}>
                {!photoURL ?
                    <PersonIcon className={classes.icon} />
                    :
                    <Avatar alt={displayName} src={photoURL} className={classes.icon} />}
            </IconButton>
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
                        <ListItem key='licenses'>
                            <Link component={RouterLink} to={paths.licenses} onClick={() => setDrawerOpen(false)}>
                                <ListItemText primary={'See licenses'} />
                            </Link>
                        </ListItem>
                        <ListItem key='signOut' button onClick={signOut}>
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