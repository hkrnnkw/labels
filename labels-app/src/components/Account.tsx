import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/index';
import { Grid, Container } from '@material-ui/core';
import axios from 'axios';
import { Album } from '../utils/types';

const Account: FC = () => {
    const { uid, spotifyToken } = useSelector((rootState: RootState) => rootState.user);
    const [albums, setAlbums] = useState<Album[]>([]);

    // アルバムの情報を取得
    const fetchAlbums = async (keyword: string) => {
        const endpoint = `https://api.spotify.com/v1/search`;
        const query = `?q=${keyword.replace(' ', '%20')}&type=album`;
        const url = `${endpoint}${query}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${spotifyToken}`,
                },
            });
            // TODO responseを加工
            const results: Album[] = [];
            Object.keys(response.data.albums.items).forEach(num => {
                const item = response.data.albums.items[`${num}`];
                const album: Album = {
                    artists: item.artists,
                    id: item.id,
                    images: item.images,
                    name: item.name,
                    releaseDate: item.releaseDate,
                };
                results.push(album);
            });
            setAlbums(results);
        } catch (err) {
            console.log(`Spotifyフェッチエラー：${err}`);
        }
    };

    useEffect(() => {
        fetchAlbums('oklou galore').catch(err => console.log(err));
    }, []);

    return (
        <Container>
            {albums.length > 0 &&
                <Grid>{albums[0].name}</Grid>
            }
        </Container>
    )
};

export default withRouter(Account);