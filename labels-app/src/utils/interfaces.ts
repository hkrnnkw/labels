import { RouteComponentProps } from 'react-router-dom';
import { Image } from './types';

export interface Props extends RouteComponentProps {
    tokenChecker: () => Promise<string>;
}

interface SimpleArtist {
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
}

export interface Artist extends SimpleArtist {
    followers: {
        href: string;
        total: number;
    };
    genres: string[];
    images: Image[];
    popularity: number;
}

interface SimpleTrack {
    artists: SimpleArtist[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    href: string;
    id: string;
    is_playable	: boolean;
    name: string;
    preview_url: string;
    track_number: string;
}

export interface SimpleAlbum {
    album_type: string;
    artists: SimpleArtist[];
    id: string;
    images: Image[];
    name: string;
}

export interface Album extends SimpleAlbum {
    copyright: {
        text: string;
        type: string;
    };
    genres: string[];
    label: string;
    release_date: string;
    tracks: {
        items: SimpleTrack[];
    };
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
}