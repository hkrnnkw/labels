import { Album } from "./interfaces";

export type StrKeyObj = { [key: string]: string };

export type Image = {
    width: number;
    height: number;
    url: string;
}

export type Auth = {
    signedIn: boolean;
    refreshToken: string;
    emailVerified: boolean;
}

export type Spotify = {
    spotify: {
        token: string;
        expiresIn: number;
        refreshToken: string;
    };
}

export type SearchQuery = {
    getNew?: boolean;
    year?: number;
    genre?: string;
    label?: string;
    keywords?: string;
}

export type SearchResult = {
    query: SearchQuery;
    results: Album[];
}

export type Label = {
    name: string;
    dateOfFollow?: number;
}

export type Home = Label & {
    newReleases: Album[];
}

export type SortOrder = 'DateAsc' | 'DateDesc' | 'NameAsc' | 'NameDesc';