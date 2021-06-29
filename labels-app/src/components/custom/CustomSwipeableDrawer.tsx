import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, Button, ListItem, ListItemText,
} from '@material-ui/core';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import { setSortOrder } from '../../stores/albums';
import { SortOrder } from '../../utils/types';
import { RF, ABC, NNR } from '../../handlers/sortHandler';

export interface SwipeableDrawerProps {
    currentSortOrder: SortOrder,
    disabled: boolean,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {
        backgroundColor: theme.palette.background.default,
    },
    button: {
        width: '100vw',
        '& .MuiButton-label': {
            justifyContent: 'flex-start',
            textTransform: 'none',
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

export const CustomSwipeableDrawer: FC<SwipeableDrawerProps> = ({ currentSortOrder, disabled }) => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const sortOrderList: SortOrder[] = [RF, ABC, NNR];

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const createList = () => (
        <List>
            {sortOrderList.map(elm => (
                <ListItem button onClick={() => dispatch(setSortOrder(elm))}>
                    <ListItemText primary={elm} />
                </ListItem>
            ))}
        </List>
    );

    return (
        <div>
            <Button
                className={classes.button}
                onClick={toggleDrawer(true)}
                disabled={disabled}
                startIcon={<ImportExportIcon />}
            >
                {currentSortOrder}
            </Button>
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