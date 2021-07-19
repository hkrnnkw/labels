import React, { FC } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Album } from '../../utils/interfaces';
import { Year } from '../../utils/types';
import {
    Container, Typography,
} from '@material-ui/core';
import { CustomGridList } from './CustomGridList';

interface ContainerOfYearsProps {
    years: Year,
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
        margin: theme.spacing(4, 0),
        '& p': {
            margin: theme.spacing(0, 4),
            '&#year': {
                fontSize: '1.25rem',
            },
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

export const ContainerOfYears: FC<ContainerOfYearsProps> = ({ years }) => {
    const classes = ambiguousStyles();
    const entries: [string, Album[]][] = Object.entries(years);
    const sorted = entries.sort((a, b) => a[0] > b[0] ? -1 : a[0] < b[0] ? 1 : 0);

    return <>
        {sorted.map(([year, albums]) => (
            <Container className={classes.container} id={year}>
                <Typography id={'year'}>{year}</Typography>
                {!albums.length ?
                    <Typography>No releases.</Typography>
                    :
                    <CustomGridList albums={albums} />
                }
            </Container>
        ))}
    </>
};