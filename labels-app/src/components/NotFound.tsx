import React, { FC } from 'react';
import { withRouter } from 'react-router';

const NotFound: FC = () => {

    return (
        <div>
            <p>ページが見つかりません</p>
        </div>
    )
};

export default withRouter(NotFound);