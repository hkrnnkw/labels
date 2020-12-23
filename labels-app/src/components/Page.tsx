import React, { FC } from 'react';
import { withRouter } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Album } from '../utils/interfaces';

const Page: FC = () => {
    const { state } = useLocation<{ album: Album }>();

    return (
        <div>
            <p>{state.album.name}</p>
        </div>
    )
};

export default withRouter(Page);