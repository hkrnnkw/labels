import React, { FC } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { auth } from '../firebase';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Link, List, ListItem, Button, 
} from '@material-ui/core';
import { label as labelPath } from '../utils/paths';
import { LabelEntry } from '../utils/types';
import { sortHandler } from '../handlers/sortHandler';
import { CustomSwipeableDrawer } from './custom/CustomSwipeableDrawer';

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

const Account: FC = () => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { home, sortOrder } = useSelector((rootState: RootState) => rootState.albums);
    const sorted: LabelEntry[] = sortHandler(Object.entries(home), sortOrder);

    // サインアウト
    const signOut = async () => await auth.signOut();

    return (
        <div className={classes.root}>
            <CustomSwipeableDrawer currentSortOrder={sortOrder} disabled={!sorted.length} />
            {sorted.length > 0 ?
                <List>
                    {sorted.map(([name, fav]) => {
                        return (
                            <Link component={RouterLink} to={{ pathname: `${labelPath}/${name}`, state: { label: name } }}>
                                <ListItem>{name}</ListItem>
                            </Link>
                        )
                    })}
                </List>
                :
                <Typography>You have not followed labels yet.</Typography>
            }
            <Button onClick={signOut}>ログアウト</Button>
        </div>
    )
};

export default withRouter(Account);