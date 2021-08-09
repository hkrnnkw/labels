import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Container, Link, Typography } from '@material-ui/core';
import { Label } from '../../utils/types';
import { paths } from '../../utils/paths';
import { CustomGridList } from './CustomGridList';
import { FollowButton } from './FollowButton';

interface ContainerOfLabelProps {
    label: Label,
    tokenChecker: () => Promise<string>,
    isDefault?: boolean,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    container: {
        width: '100vw',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        padding: 0,
        margin: theme.spacing(0, 0, 11),
        '& p': {
            margin: theme.spacing(0, 4),
            color: theme.palette.text.disabled,
        },
    },
    labelName: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        height: '32px',
        fontSize: '1.6rem',
        lineHeight: 1.2,
        letterSpacing: '0.00938em',
        padding: theme.spacing(2, 0),
        margin: theme.spacing(0, 4),
        display: 'inline',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&#isDefault': {
            width: `calc(100vw - 122px)`,
            margin: theme.spacing(0, 2, 0, 4),
        },
    },
    '@media (min-width: 960px)': {
        
    },
}));

export const ContainerOfLabel: FC<ContainerOfLabelProps> = ({ label, tokenChecker, isDefault = false }) => {
    const classes = ambiguousStyles();
    const { name: labelName, newReleases } = label;

    return (
        <Container className={classes.container} id={labelName}>
            <Link
                className={classes.labelName}
                id={isDefault ? 'isDefault' : undefined}
                component={RouterLink}
                to={{ pathname: `${paths.label}/${labelName}`, state: { labelName: labelName } }}
            >
                {labelName}
            </Link>
            {isDefault && <FollowButton labelName={labelName} tokenChecker={tokenChecker} />}
            {!newReleases.length ?
                <Typography>No releases recently.</Typography>
                :
                <CustomGridList albums={newReleases} tokenChecker={tokenChecker} />
            }
        </Container>
    );
};