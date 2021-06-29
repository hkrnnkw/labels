import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, IconButton, ListItem, ListItemText,
} from '@material-ui/core';
import SortIcon from '@material-ui/icons/Sort';
import { setSortOrder } from '../../stores/albums';
import { SortOrder } from '../../utils/types';
import { DATE_ASC, DATE_DESC, NAME_ASC, NAME_DESC } from '../../handlers/sortHandler';

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

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    // レーベルの並び替え
    const sortOrderList = [DATE_DESC, DATE_ASC, NAME_ASC, NAME_DESC];
    const handleSortOrder = (option: string) => {
        const newSortOrder = (): SortOrder => {
            switch (option) {
                case DATE_ASC: return 'DateAsc';
                case DATE_DESC: return 'DateDesc';
                case NAME_ASC: return 'NameAsc';
                case NAME_DESC: return 'NameDesc';
                default: return 'DateDesc';
            }
        }
        dispatch(setSortOrder(newSortOrder()));
    };

    const createList = () => (
        <List>
            {sortOrderList.map(sortOrder => (
                <ListItem button onClick={() => handleSortOrder(sortOrder)}>
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