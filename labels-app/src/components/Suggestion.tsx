import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { RootState } from '../stores/index';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AppBar, Link, Container, Toolbar, Typography } from '@material-ui/core';
import { setNeedDefaults } from '../stores/albums';
import { Label, SearchResult } from '../utils/types';
import { Props } from '../utils/interfaces';
import { searchAlbums } from '../handlers/spotifyHandler';
import { ContainerOfLabel } from './custom/ContainerOfLabel';
import { home as homePath } from '../utils/paths';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        height: 'max-content',
        backgroundColor: theme.palette.background.paper,
        position: 'absolute',
        top: '0px',
        zIndex: 1300,
    },
    header: {
        fontWeight: 500,
        color: theme.palette.background.paper,
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(1, 4),
        '& div.MuiToolbar-regular': {
            width: '100%',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 0,
        },
        '& a.MuiLink-root': {
            color: theme.palette.background.paper,
            margin: 0,
            fontSize: '0.8rem',
        },
    },
    container: {
        padding: theme.spacing(15, 0, 6),
        '& button': {
            margin: theme.spacing(0, 4, 0, 0),
            '&#following': {
                color: theme.palette.background.paper,
            },
        },
        '& h6.MuiTypography-subtitle2': {
            color: theme.palette.secondary.light,
        },
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Suggestion: FC<Props> = ({ tokenChecker }) => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const { home } = useSelector((rootState: RootState) => rootState.albums);
    const [defaultLabels, setDefaultLabels] = useState<Label[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Labels';
    }, []);

    useEffect(() => {
        const DEFAULT_LABELS: string[] = [
            '4AD', 'AD 93', 'aritech', 'Because Music', 'Brainfeeder', 'Dirty Hit', 'Dog Show Records',
            'Domino Recording Co', 'EQT Recordings', 'Ghostly International', 'Hyperdub', 'Jagjaguwar',
            'Ninja Tune', 'PAN', 'Perpetual Novice', 'Republic Records', 'Rough Trade',
            'Smalltown Supersound', 'Stones Throw Records', 'Text Records', 'Warp Records', 'XL Recordings', 
        ];

        // デフォルトレーベルの情報を取得
        const fetchLabels = async () => {
            const token: string = await tokenChecker();
            const tasks = DEFAULT_LABELS.map(name => searchAlbums({ label: name, getNew: true }, token));
            const results: SearchResult[] = await Promise.all(tasks);

            const labelList: Label[] = results.map(result => {
                const labelName = result.query.label || '';
                return {
                    name: labelName,
                    date: -1,
                    newReleases: result.albums,
                } as Label;
            });
            setDefaultLabels(labelList);
        };

        fetchLabels()
            .catch(err => console.error(`Spotifyフェッチエラー：${err}`));
    }, [tokenChecker]);

    return (
        <div className={classes.contentClass}>
            <AppBar position='fixed' className={classes.header}>
                <Toolbar>
                    <Typography>Which are your favorites?</Typography>
                    <Link component={RouterLink} to={homePath} onClick={() => dispatch(setNeedDefaults(false))}>
                        {!Object.keys(home).length ? 'Skip' : 'Done'}
                    </Link>
                </Toolbar>
            </AppBar>
            <Container className={classes.container}>
                {defaultLabels.map(label =>
                    <ContainerOfLabel label={label} tokenChecker={tokenChecker} isDefault={true} />)}
            </Container>
        </div>
    );
};

export default withRouter(Suggestion);