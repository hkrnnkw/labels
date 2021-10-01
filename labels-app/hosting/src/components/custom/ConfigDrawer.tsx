import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../../stores/index';
import { auth } from '../../firebase';
import { setClearUser } from '../../stores/user';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, Button, ListItem, ListItemText, Avatar, IconButton,
    Link,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { paths } from '../../utils/paths';
import { switchIsProcessing } from '../../stores/app';
import { signIn } from '../../handlers/spotifyHandler';

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
        padding: theme.spacing(2),
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

export const ConfigDrawer: FC = () => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { isProcessing } = useSelector((rootState: RootState) => rootState.app);
    const { signedIn, displayName, photoURL } = useSelector((rootState: RootState) => rootState.user);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    // サインイン／アウト操作
    const handleSignInOut = async (toOut: boolean | undefined) => {
        setDrawerOpen(false);
        if (toOut) {
            dispatch(setClearUser());
            await auth.signOut();
        }
        else {
            dispatch(switchIsProcessing(true));
            await signIn();
        }
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
                                <ListItemText primary={'View licenses'} />
                            </Link>
                        </ListItem>
                        <ListItem
                            key='signInOut'
                            button
                            onClick={() => handleSignInOut(signedIn)}
                            disabled={isProcessing}
                        >
                            {signedIn ? <ListItemText primary={'Sign out'} id={'signOut'} />
                                : <ListItemText primary={'Sign in'} />}
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