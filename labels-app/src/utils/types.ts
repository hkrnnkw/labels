import { Album } from "./interfaces";

export type StrKeyObj = {[key: string]: string};

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
        expiresIn: string;
        refreshToken: string;
    };
}

export type SearchResult = {
    search: {
        keywords: string;
        results: Album[];
    };
}