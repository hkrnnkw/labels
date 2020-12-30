import React, { FC, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, List, ListItem, Link,
} from '@material-ui/core';
import { Album, Artist } from '../utils/interfaces';
import { album, artist } from '../utils/paths';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    root: {

    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Label: FC = () => {
    const classes = ambiguousStyles();
    const { state } = useLocation<{ label: string }>();
    const { spotify, uid } = useSelector((rootState: RootState) => rootState.user);

    useEffect(() => {
        // Redux (album.ts -> home) に保存済みでないかチェック
        // エンドポイント叩く　await getAlbumsOfLabels()
    });

    return (
        <div className={classes.root}>
            <Typography>{state.label}</Typography>
            <List>
                {/* TODO アルバムを取得  */}
            </List>
        </div>
    )
};

export default withRouter(Label);