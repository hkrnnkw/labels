import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RF } from "../handlers/sortHandler";
import { Album } from '../utils/interfaces';
import { Label, SearchResult, SortOrder } from "../utils/types";

type AlbumsState = {
    home: Label;
    saved: Album[];
    sortOrder: SortOrder;
    searched: SearchResult;
}

const initialState: AlbumsState = {
    home: {},
    saved: [],
    sortOrder: RF,
    searched: { query: {}, albums: [] },
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setAddLabel: (state: AlbumsState, action: PayloadAction<Label>) => {
            state.home = {...state.home, ...action.payload};
        },
        setDeleteLabel: (state: AlbumsState, action: PayloadAction<string>) => {
            if (!state.sortOrder) {
                state.home[action.payload].date = -1;
                return;
            }
            delete state.home[action.payload];
        },
        setSaved: (state: AlbumsState, action: PayloadAction<Album[]>) => {
            state.saved = action.payload;
        },
        setSortOrder: (state: AlbumsState, action: PayloadAction<SortOrder>) => {
            state.sortOrder = action.payload;
        },
        setSearched: (state: AlbumsState, action: PayloadAction<SearchResult>) => {
            state.searched = action.payload;
        },
        clearSearched: (state: AlbumsState) => {
            state.searched = initialState.searched;
        },
    },
});

export default slice;

export const { setAddLabel, setDeleteLabel, setSaved, setSortOrder, setSearched, clearSearched } = slice.actions;