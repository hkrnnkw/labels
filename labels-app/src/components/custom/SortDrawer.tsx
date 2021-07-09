import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, Button, ListItem, ListItemText,
} from '@material-ui/core';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import CheckIcon from '@material-ui/icons/Check';
import { setSortOrder } from '../../stores/albums';
import { SortOrder } from '../../utils/types';
import { RF, ABC, NNR } from '../../handlers/sortHandler';

interface SortDrawerProps {
    currentSortOrder: SortOrder,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {
        backgroundColor: theme.palette.background.default,
    },
    openButton: {
        display: 'flex',
        padding: theme.spacing(1.5, 0),
        margin: theme.spacing(0, 4),
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
    selectedItem: {
        color: 'Purple',
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

export const SortDrawer: FC<SortDrawerProps> = ({ currentSortOrder }) => {
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

    const doSort = (newSortOrder: SortOrder) => {
        dispatch(setSortOrder(newSortOrder));
        setDrawerOpen(false);
    };

    const createList = () => (
        <List>
            <ListItem><ListItemText secondary='Sort by' /></ListItem>
            {sortOrderList.map((elm: SortOrder) => (
                <ListItem button onClick={() => doSort(elm)}>
                    {elm === currentSortOrder ?
                        <ListItemText primary={elm} className={classes.selectedItem} />
                        :
                        <ListItemText primary={elm} />
                    }
                    {elm === currentSortOrder && <CheckIcon className={classes.selectedItem} />}
                </ListItem>
            ))}
        </List>
    );

    return (
        <div>
            <Button
                className={classes.openButton}
                onClick={toggleDrawer(true)}
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
                >
                    {createList()}
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