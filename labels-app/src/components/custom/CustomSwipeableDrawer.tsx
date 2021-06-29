import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, IconButton, ListItem, ListItemText,
} from '@material-ui/core';
import SortIcon from '@material-ui/icons/Sort';
import { setSortOrder } from '../../stores/albums';
import { SortOrder } from '../../utils/types';
import { RF, ABC } from '../../handlers/sortHandler';

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

export const CustomSwipeableDrawer: FC = () => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const sortOrderList: SortOrder[] = [RF, ABC];

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const createList = () => (
        <List>
            {sortOrderList.map(sortOrder => (
                <ListItem button onClick={() => dispatch(setSortOrder(sortOrder))}>
                    <ListItemText primary={sortOrder} />
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