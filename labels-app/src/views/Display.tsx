import React, { FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

interface Props extends RouteComponentProps {

}

const Display: FC<Props> = () =>
    <div>
        <p>Hello React</p>
    </div>;

export default withRouter(Display);