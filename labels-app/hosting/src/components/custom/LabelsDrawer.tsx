import React, { FC, useState, KeyboardEvent, MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    SwipeableDrawer, List, ListItem, ListItemText, Link, Button,
} from '@material-ui/core';
import { paths } from '../../utils/paths';
import { FollowButton } from './FollowButton';

interface LabelsDrawerProps {
    labelNames: string[],
    tokenChecker: () => Promise<string>,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100%',
        display: 'flex',
        position: 'relative',
        justifyContent: 'space-between',
    },
    labelName: {
        width: 'calc(100% - 80px)',
        height: '32px',
        fontSize: '1.6rem',
        lineHeight: 1.2,
        letterSpacing: '0.00938em',
        padding: theme.spacing(2, 0),
        display: 'inline',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    openButton: {
        minWidth: '80px',
        padding: theme.spacing(1, 2),
        color: theme.palette.text.primary,
        backgroundColor: 'transparent',
        transition: 'none',
    },
    paper: {
        height: 'max-content',
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        borderRadius: '16px 16px 0 0',
        '& .MuiTypography-colorTextSecondary': {
            color: theme.palette.text.secondary,
            fontSize: '0.8rem',
            fontWeight: 700,
        },
    },
    labelList: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        margin: theme.spacing(0, 4),
        paddingTop: theme.spacing(4),
        '& li': {
            display: 'inline-flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            padding: theme.spacing(4, 0, 0),
            '& a.MuiLink-root': {
                color: theme.palette.text.primary,
                width: 'calc(100% - 88px)',
                margin: theme.spacing(0, 2, 0, 0),
                '& span.MuiTypography-body1': {
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                },
            },
        },
    },
    cancelButton: {
        width: '100vw',
        height: '7.5vh',
        color: theme.palette.text.secondary,
    },
    '@media (min-width: 960px)': {

    },
}));

export const LabelsDrawer: FC<LabelsDrawerProps> = ({ labelNames, tokenChecker }) => {
    const classes = ambiguousStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const restOfLabels: number = labelNames.length - 1;

    // メニューの開閉
    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const generateLabels = () => {
        return labelNames.map(labelName => (
            <ListItem>
                <Link component={RouterLink} to={{ pathname: `${paths.label}/${labelName}`, state: { labelName: labelName } }}>
                    <ListItemText primary={labelName} />
                </Link>
                <FollowButton labelName={labelName} tokenChecker={tokenChecker} />
            </ListItem>
        ));
    };

    return (
        <div className={classes.contentClass}>
            <Link
                className={classes.labelName}
                component={RouterLink}
                to={{ pathname: `${paths.label}/${labelNames[0]}`, state: { labelName: labelNames[0] } }}
            >
                {labelNames[0]}
            </Link>
            <Button
                className={classes.openButton}
                onClick={toggleDrawer(true)}
            >
                {`+${restOfLabels} ${restOfLabels > 1 ? 'labels' : 'label'}`}
            </Button>
            <SwipeableDrawer
                anchor={'bottom'}
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
                classes={{ paper: classes.paper }}
            >
                <div role='presentation'>
                    <List className={classes.labelList}>
                        {generateLabels()}
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
    );
};