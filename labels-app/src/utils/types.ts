export type StrKeyObj = {[key: string]: string};

export type Album = {
    label: string;
    artists: Object[];
    id: string;
    images: Object[];
    name: string;
    release_date: string;
    genres: string[];
    album_type: string,
};

export type Image = {
    height: number,
    url: string,
    width: number,
};

export type Artist = {
    external_urls: {
        spotify: string,
    },
    href: string,
    id: string,
    name: string,
    type: string,
    uri: string,
};