import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';
import { SearchResult } from "../utils/types";

type AlbumsState = SearchResult & {
    home: Album[][];
    saved: Album[];
}

const initialState: AlbumsState = {
    home: [],
    saved: [],
    search: {
        keywords: '',
        results: [],
    },
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setHome: (state: AlbumsState, action: PayloadAction<Album[][]>) => {
            state.home = action.payload;
        },
        setSaved: (state: AlbumsState, action: PayloadAction<Album[]>) => {
            state.saved = action.payload;
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

export const { setHome, setSaved, setSearch, setClearAlbums } = slice.actions;