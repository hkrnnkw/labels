import React, { FC } from 'react';
import { withRouter } from 'react-router';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import {
    Typography, Link, List, ListItem,
} from '@material-ui/core';
import { label as labelPath } from '../utils/paths';

const Account: FC = () => {
    const { home } = useSelector((rootState: RootState) => rootState.albums);

    return (
        <div>
            <Typography>マイページ</Typography>
            {home.length > 0 ?
                <List>
                    {home.map(label => {
                        return (
                            <Link component={RouterLink} to={{ pathname: `${labelPath}/${label}`, state: { label: label } }}>
                                <ListItem>{label}</ListItem>
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