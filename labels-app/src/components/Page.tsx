import React, { FC } from 'react';
import { withRouter } from 'react-router';

const Page: FC = () => {

    return (
        <div>
            <p>Pageコンポーネントです</p>
        </div>
    )
};

export default withRouter(Page);