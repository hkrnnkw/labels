import React, { FC } from 'react';
import { withRouter } from 'react-router';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import {
    Typography, Link, List, ListItem,
} from '@material-ui/core';
import { label as labelPath } from '../utils/paths';
import { LabelEntry } from '../utils/types';
import { sortHandler } from '../handlers/sortHandler';

const Account: FC = () => {
    const { home, sortOrder } = useSelector((rootState: RootState) => rootState.albums);
    const sorted: LabelEntry[] = sortHandler(home, sortOrder);

    return (
        <div>
            <Typography>マイページ</Typography>
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
                <Typography>フォローしているレーベルがまだありません</Typography>
            }
        </div>
    )
};

export default withRouter(Account);