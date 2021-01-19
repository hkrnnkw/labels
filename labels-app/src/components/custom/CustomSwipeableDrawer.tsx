import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, IconButton, ListItem, ListItemText,
} from '@material-ui/core';
import SortIcon from '@material-ui/icons/Sort';

export interface SwipeableDrawerProps {
    texts: string[],
    action: (text: string) => void,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {
        backgroundColor: theme.palette.background.default,
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

export const CustomSwipeableDrawer: FC<SwipeableDrawerProps> = ({ texts, action }) => {
    const classes = ambiguousStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const createList = () => (
        <List>
            {texts.map(text => (
                <ListItem button onClick={() => action(text)}>
                    <ListItemText primary={text} />
                </ListItem>
            ))}
        </List>
    );

    return (
        <div>
            <IconButton onClick={toggleDrawer(true)}><SortIcon /></IconButton>
            <SwipeableDrawer
                anchor={'bottom'}
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
            >
                <div
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    {createList()}
                </div>
            </SwipeableDrawer>
        </div>
    )
};