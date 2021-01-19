import React, { FC } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { auth } from '../firebase';
import { RootState } from '../stores/index';
import { setSortOrder } from '../stores/albums';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Link, List, ListItem, Button, 
} from '@material-ui/core';
import { label as labelPath } from '../utils/paths';
import { LabelEntry, SortOrder } from '../utils/types';
import { DATE_ASC, DATE_DESC, NAME_ASC, NAME_DESC, sortHandler } from '../handlers/sortHandler';
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
    const sorted: LabelEntry[] = sortHandler(home, sortOrder);
    const filtered = sorted.filter(([name, fav]) => fav.date > 0);

    // サインアウト
    const signOut = async () => await auth.signOut();

    // レーベルの並び替え
    const sortOrderList = [DATE_DESC, DATE_ASC, NAME_ASC, NAME_DESC];
    const handleSortOrder = (option: string) => {
        const getSortOrder = (): SortOrder => {
            switch (option) {
                case DATE_ASC: return 'DateAsc';
                case DATE_DESC: return 'DateDesc';
                case NAME_ASC: return 'NameAsc';
                case NAME_DESC: return 'NameDesc';
                default: return null;
            }
        };
        const newOrder: SortOrder = getSortOrder();
        dispatch(setSortOrder(newOrder));
    };

    return (
        <div className={classes.root}>
            <CustomSwipeableDrawer texts={sortOrderList} action={handleSortOrder} />
            {filtered.length > 0 ?
                <List>
                    {filtered.map(([name, fav]) => {
                        return (
                            <Link component={RouterLink} to={{ pathname: `${labelPath}/${name}`, state: { label: name } }}>
                                <ListItem>{name}</ListItem>
                            </Link>
                        )
                    })}
                </List>
                :
                <Typography>フォローしているレーベルがまだありません</Typography>
            }
            <Button onClick={signOut}>ログアウト</Button>
        </div>
    )
};

export default withRouter(Account);