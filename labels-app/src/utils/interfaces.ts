export interface Album {
    label: string;
    artists: Object[];
    id: string;
    images: Object[];
    name: string;
    release_date: string;
    genres: string[];
    album_type: string;
}

export interface Artist {
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
}