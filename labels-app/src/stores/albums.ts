import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';
import { SearchResult } from "../utils/types";

type AlbumsState = SearchResult & {
    guestHome: Album[][];
    privateHome: Album[][];
}

const initialState: AlbumsState = {
    guestHome: [],
    privateHome: [],
    search: {
        keywords: '',
        results: [],
    },
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setGuestHome: (state: AlbumsState, action: PayloadAction<Album[][]>) => {
            state.guestHome = action.payload;
        },
        setPrivateHome: (state: AlbumsState, action: PayloadAction<Album[][]>) => {
            state.privateHome = action.payload;
        },
        setSearch: (state: AlbumsState, action: PayloadAction<SearchResult>) => {
            const { keywords: keyword, results: result } = action.payload.search;
            state.search.keywords = keyword;
            state.search.results = result;
        },
        setClearAlbums: () => {
            return initialState;
        },
    },
});

export default slice;

export const { setGuestHome, setPrivateHome, setSearch, setClearAlbums } = slice.actions;