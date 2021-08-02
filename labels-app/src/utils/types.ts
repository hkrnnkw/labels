import { ABC, NNR, RF } from "../handlers/sortHandler";
import { Album } from "./interfaces";

export type StrKeyObj = { [key: string]: string };

export type Image = {
    width: number;
    height: number;
    url: string;
}

export type SignedIn = {
    signedIn: boolean | undefined;
}

export type FirebaseUser = {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    refreshToken: string;
    emailVerified: boolean;
}

export type Spotify = {
    token: string;
    exp: number;
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

export type Label = {
    name: string;
    date: number;
    newReleases: Album[];
}

export type Year = { [year: string]: Album[] };

const SortOrderCA = {
    RF: RF,
    ABC: ABC,
    NNR: NNR,
} as const;
export type SortOrder = typeof SortOrderCA[keyof typeof SortOrderCA];

export type Copyright = {
    text: string;
    type: string;
}

export type Saved = {
    albumId: string;
    inLib: boolean;
}

export type Variant = {
    saved: Saved;
    labelName: string;
    copyright: Copyright;
}