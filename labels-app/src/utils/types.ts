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
    };
}

export type SearchQuery = {
    getNew?: boolean;
    year?: string;
    genre?: string;
    label?: string;
    keywords?: string;
}

export type SearchResult = {
    query: SearchQuery;
    albums: Album[];
}

export type Favorite = {
    date: number;
    newReleases: Album[];
}

export type Label = { [name: string]: Favorite };

export type LabelEntry = [string, Favorite];

export type Year = { [year: string]: Album[] };

export type SortOrder = 'DateAsc' | 'DateDesc' | 'NameAsc' | 'NameDesc' | null;