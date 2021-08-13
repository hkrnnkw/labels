import React, { FC } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Album } from '../../utils/interfaces';
import {
    Container, Typography,
} from '@material-ui/core';
import { CustomGridList } from './CustomGridList';

interface ContainerOfYearProps {
    yearEntry: [string, Album[]],
    tokenChecker: () => Promise<string>,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    container: {
        width: '100vw',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        overflow: 'hidden',
        padding: 0,
        margin: theme.spacing(0, 0, 11),
        '& p': {
            margin: theme.spacing(0, 4),
            '&#year': {
                fontSize: '1.2rem',
                color: theme.palette.text.secondary,
            },
            '&#falsyMessage': {
                color: theme.palette.text.disabled,
            },
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

export const ContainerOfYear: FC<ContainerOfYearProps> = ({ yearEntry, tokenChecker }) => {
    const classes = ambiguousStyles();
    const [year, albums] = yearEntry;

    return (
        <Container className={classes.container} id={year}>
            <Typography id={'year'}>{year}</Typography>
            {!albums.length ?
                <Typography id='falsyMessage'>No releases.</Typography>
                :
                <CustomGridList albums={albums} tokenChecker={tokenChecker} />
            }
        </Container>
    )
};