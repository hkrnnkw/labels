import { Image } from './types';

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

type SimpleTrack = {
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

export interface Album {
    album_type: string;
    artists: SimpleArtist[];
    copyright: {
        text: string;
        type: string;
    };
    genres: string[];
    id: string;
    images: Image[];
    label: string;
    name: string;
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