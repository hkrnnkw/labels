import React, { FC } from 'react';
import { withRouter } from 'react-router';
import {
    Typography,
} from '@material-ui/core';

const Account: FC = () => {

    return (
        <div>
            <Typography>マイページ</Typography>
        </div>
    )
};

export default withRouter(Account);