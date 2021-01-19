import React, { FC } from 'react';
import { withRouter } from 'react-router';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { auth } from '../firebase';
import { RootState } from '../stores/index';
import {
    Typography, Link, List, ListItem, Button, 
} from '@material-ui/core';
import { label as labelPath } from '../utils/paths';
import { LabelEntry } from '../utils/types';
import { sortHandler } from '../handlers/sortHandler';

const Account: FC = () => {
    const { home, sortOrder } = useSelector((rootState: RootState) => rootState.albums);
    const sorted: LabelEntry[] = sortHandler(home, sortOrder);
    const filtered = sorted.filter(([name, fav]) => fav.date > 0);

    // サインアウト
    const signOut = async () => await auth.signOut();

    return (
        <div>
            <Typography>マイページ</Typography>
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