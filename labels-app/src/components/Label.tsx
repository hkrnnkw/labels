import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography,
} from '@material-ui/core';
import { Props, Album, Artist } from '../utils/interfaces';
import { SearchResult, Year } from '../utils/types';
import { getArtists, searchAlbums, isVariousAritist } from '../handlers/spotifyHandler';
import { FollowButton } from './custom/FollowButton';
import { ContainerOfYears } from './custom/ContainerOfYears';
import { AvatarsDrawer } from './custom/AvatarsDrawer';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '64px',
        display: 'flex',
        flexDirection: 'column',
    },
    labelName: {
        color: theme.palette.text.secondary,
        width: `calc(100% - ${theme.spacing(8)}px)`,
        fontSize: '1.6rem',
        lineHeight: 1.2,
        fontWeight: 700,
        wordBreak: 'break-all',
        margin: theme.spacing(0, 4),
        padding: theme.spacing(2, 0),
        display: 'inline',
    },
    subHeader: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        height: '56px',
        display: 'flex',
        margin: theme.spacing(0, 4, 2),
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

const Label: FC<Props> = ({ tokenChecker }) => {
    const classes = ambiguousStyles();
    const { labelName } = useLocation<{ labelName: string }>().state;
    const [albumsOfYears, setAlbumsOfYears] = useState<Year>({});
    const [artistsOfLabel, setArtistsOfLabel] = useState<Artist[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = labelName;
    }, [labelName]);

    // レーベルの各年のアルバムを取得
    useEffect(() => {
        const getLast5Years = (): number[] => {
            const today = new Date();
            const thisYear = today.getFullYear();
            return new Array(5).fill(thisYear).map((y: number, i: number) => y - i);
        };

        const fetchLabel = async (): Promise<Year> => {
            const token: string = await tokenChecker();
            const last5years: number[] = getLast5Years();
            const tasks = last5years.map(year => searchAlbums({ label: labelName, year: year.toString() }, token));
            const results: SearchResult[] = await Promise.all(tasks);

            const yearObj: Year = {};
            for (const result of results) yearObj[result.query.year || ''] = result.albums;
            return yearObj;
        };
        fetchLabel()
            .then(albums => setAlbumsOfYears(albums))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [labelName, tokenChecker]);

    // レーベルのアーティストを取得
    useEffect(() => {
        const albums: Album[] = Object.values(albumsOfYears).flat();
        if (!albums.length) return;

        const simpleArtists = albums.flatMap(album => album.artists || []);
        const tempArtistIds: string[] = simpleArtists.flatMap(artist => isVariousAritist(artist.name) ? [] : [artist.id]);
        const artistIds = Array.from(new Set<string>(tempArtistIds));

        const fetchArtists = async (): Promise<Artist[]> => {
            const token: string = await tokenChecker();
            return await getArtists(artistIds, token);
        };
        fetchArtists()
            .then(artists => setArtistsOfLabel(artists))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [albumsOfYears, tokenChecker]);

    return (
        <div className={classes.contentClass}>
            <Typography className={classes.labelName}>{labelName}</Typography>
            <div className={classes.subHeader}>
                <AvatarsDrawer artists={artistsOfLabel} labelName={labelName} />
                <FollowButton labelName={labelName} tokenChecker={tokenChecker} />
            </div>
            <ContainerOfYears years={albumsOfYears} tokenChecker={tokenChecker} />
        </div>
    )
};

export default withRouter(Label);