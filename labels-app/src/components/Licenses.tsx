import React, { FC, useEffect } from 'react';
import { withRouter } from 'react-router';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Container, Link, List, ListItem, ListItemText, Typography,
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import licensesFile from '../licenses.json'
import { License } from '../utils/types';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        top: '52px',
        display: 'flex',
        justifyContent: 'center',
    },
    container: {
        width: `calc(100vw - ${theme.spacing(8)}px)`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        overflow: 'hidden',
        padding: 0,
        margin: theme.spacing(2, 4, 6),
        '& h2': {
            fontSize: '1.2rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
            padding: theme.spacing(2, 0),
            margin: theme.spacing(0, 0, 2),
        },
    },
    list: {
        width: '100%',
        '& li.MuiListItem-gutters': {
            padding: 0,
            margin: theme.spacing(0, 0, 9),
            display: 'list-item',
            '& a.MuiLink-root': {
                display: 'flex',
                alignItems: 'center',
                '& div.MuiListItemText-root': {
                    '& span': {
                        fontSize: '1.0rem',
                        color: theme.palette.primary.main,
                        '& svg.MuiSvgIcon-root': {
                            width: '16px',
                            height: '16px',
                            paddingLeft: theme.spacing(2),
                        },
                    },
                },
            },
            '& div.MuiListItemText-root': {
                '& span': {
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                },
                '& p#licenseText': {
                    fontWeight: 200,
                },
            },
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Licenses: FC = () => {
    const classes = ambiguousStyles();
    const _licensesFile: { [key: string]: {} } = licensesFile;
    const entries: [string, License][] = Object.entries(_licensesFile);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Labels';
    }, []);

    const createLicenseList = (_entries: [string, License][]): JSX.Element[] => {
        return _entries.map(([key, value]) => {
            const { licenses, repository, publisher, copyright, licenseText } = value;
            return (
                <ListItem key={key}>
                    <Link href={repository} target='_blank' rel='noopener noreferrer'>
                        <ListItemText>{key}<OpenInNewIcon/></ListItemText>
                    </Link>
                    <ListItemText primary={`published by ${publisher}`} />
                    <ListItemText primary={licenses} />
                    <ListItemText secondary={licenseText} id='licenseText' />
                    <ListItemText secondary={copyright} />
                </ListItem>
            )
        });
    };

    return (
        <div className={classes.contentClass}>
            <Container className={classes.container}>
                <Typography variant='h2'>Open source licenses</Typography>
                <List className={classes.list}>{createLicenseList(entries)}</List>
            </Container>
        </div>
    );
};

export default withRouter(Licenses);