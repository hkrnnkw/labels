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
import { getArtists, searchAlbums } from '../handlers/spotifyHandler';
import { CustomGridList } from './custom/CustomGridList';
import { FollowButton } from './custom/FollowButton';

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        padding: 0,
        marginBottom: '30px',
    },
    year: {
        width: '100%',
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
        const years: Album[][] = Object.values(albumsOfYears);
        if (!years.length) return;

        const idSet = new Set<string>();
        for (const albums of years) {
            for (const album of albums) {
                for (const artist of album.artists) idSet.add(artist.id);
            }
        }

        const fetchArtists = async (): Promise<Artist[]> => {
            const token: string = await tokenChecker();
            return await getArtists(Array.from(idSet), token);
        };
        fetchArtists()
            .then(artists => setArtistsOfLabel(artists))
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

    const generateAlbums = (year: string, albums: Album[]): JSX.Element => {
        return (
            <Container className={classes.container} id={year}>
                <Typography className={classes.year}>{year}</Typography>
                {!albums.length ?
                    <Typography>No releases.</Typography>
                    :
                    <CustomGridList albums={albums} />
                }
            </Container>
        );
    };

    const generateYears = (years: Year): JSX.Element[] => {
        const entries: [string, Album[]][] = Object.entries(years);
        const sorted = entries.sort((a, b) => a[0] > b[0] ? -1 : a[0] < b[0] ? 1 : 0);
        return sorted.map(([year, albums]) => generateAlbums(year, albums));
    };

    return (
        <div>
            <Typography>{labelName}</Typography>
            <FollowButton labelName={labelName} tokenChecker={tokenChecker} />
            {artistsOfLabel.length > 0 && generateArtists(artistsOfLabel)}
            {generateYears(albumsOfYears)}
        </div>
    )
};

export default withRouter(Label);