import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Typography, Link, Container, Avatar,
} from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import { Props, Album, Artist } from '../utils/interfaces';
import { SearchResult, Year } from '../utils/types';
import { artist as artistPath } from '../utils/paths';
import { getArtists, searchAlbums, sliceArrayByNumber } from '../handlers/spotifyHandler';
import { CustomGridList } from './custom/CustomGridList';
import { FollowButton } from './custom/FollowButton';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        width: '100vw',
        minHeight: `calc(100vh - 64px)`,
        height: 'max-content',
        backgroundColor: theme.palette.background.default,
        position: 'absolute',
        top: '48px',
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
    labelName: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        fontSize: '1.6rem',
        fontWeight: 700,
        wordBreak: 'break-all',
        margin: theme.spacing(0, 4),
        padding: theme.spacing(2, 0),
    },
    subHeader: {
        width: `calc(100% - ${theme.spacing(8)}px)`,
        display: 'flex',
        margin: theme.spacing(0, 4),
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
    const [albumsOfYears, setAlbumsOfYears] = useState<Year[]>([]);
    const [artistsOfLabel, setArtistsOfLabel] = useState<Artist[]>([]);

    // レーベルの各年のアルバムを取得
    useEffect(() => {
        const getLast5Years = (): number[] => {
            const today = new Date();
            const thisYear = today.getFullYear();
            return new Array(5).fill(thisYear).map((y: number, i: number) => y - i);
        };

        const fetchLabel = async (): Promise<Year[]> => {
            const token: string = await tokenChecker();
            const last5years: number[] = getLast5Years();
            const tasks = last5years.map(year => searchAlbums({ label: labelName, year: year.toString() }, token));
            const results: SearchResult[] = await Promise.all(tasks);

            return results.map(result => ({
                yearStr: result.query.year || '',
                releases: result.albums,
            }));
        };
        fetchLabel()
            .then(albums => setAlbumsOfYears(albums))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [labelName, tokenChecker]);

    // レーベルのアーティストを取得
    useEffect(() => {
        const allAlbums: Album[] = albumsOfYears.flatMap(year => year.releases || []);
        if (!allAlbums.length) return;

        const artists = allAlbums.flatMap(album => album.artists || []);
        const idSet = new Set<string>();
        for (const artist of artists) idSet.add(artist.id);

        const fetchArtists = async (artistIds: string[]): Promise<Artist[]> => {
            const token: string = await tokenChecker();
            if (artistIds.length < 50) {
                return await getArtists(artistIds, token);
            }
            const idsSliced: string[][] = sliceArrayByNumber(artistIds, 50);
            const tasks = idsSliced.map(ids => getArtists(ids, token));
            const results: Artist[][] = await Promise.all(tasks);
            return results.flat();
        };
        fetchArtists(Array.from(idSet))
            .then(results => setArtistsOfLabel(results))
            .catch(err => console.log(`Spotifyフェッチエラー：${err}`));
    }, [albumsOfYears, tokenChecker]);

    const generateArtists = (artists: Artist[]): JSX.Element => (
        <AvatarGroup max={6}>
            {artists.map(artist => (
                <Link component={RouterLink} to={{ pathname: `${artistPath}/${artist}`, state: { artist: artist } }}>
                    <Avatar alt={artist.name} src={artist.images[0].url} />
                </Link>
            ))}
        </AvatarGroup>
    );

    const generateAlbums = (year: Year): JSX.Element => {
        const { yearStr, releases } = year;
        return (
            <Container className={classes.container} id={yearStr}>
                <Typography id={'year'}>{yearStr}</Typography>
                {!releases.length ?
                    <Typography>No releases.</Typography>
                    :
                    <CustomGridList albums={releases} />
                }
            </Container>
        );
    };

    const generateYears = (years: Year[]): JSX.Element[] => {
        const sorted = years.sort((a: Year, b: Year) => {
            return a.yearStr > b.yearStr ? -1 : a.yearStr < b.yearStr ? 1 : 0;
        });
        return sorted.map(year => generateAlbums(year));
    };

    return (
        <div className={classes.contentClass}>
            <Typography className={classes.labelName}>{labelName}</Typography>
            <div className={classes.subHeader}>
                {artistsOfLabel.length > 0 && generateArtists(artistsOfLabel)}
                <FollowButton labelName={labelName} tokenChecker={tokenChecker} />
            </div>
            {generateYears(albumsOfYears)}
        </div>
    )
};

export default withRouter(Label);