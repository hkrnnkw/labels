import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RF } from "../handlers/sortHandler";
import { Album } from '../utils/interfaces';
import { Label, SearchResult, SortOrder } from "../utils/types";

type AlbumsState = {
    home: Label[];
    saved: Album[];
    sortOrder: SortOrder;
    searched: SearchResult;
    needDefaults?: boolean;
}

const initialState: AlbumsState = {
    home: [],
    saved: [],
    sortOrder: RF,
    searched: { query: {}, albums: [] },
    needDefaults: undefined,
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setInitLabels: (state: AlbumsState, action: PayloadAction<Label[]>) => {
            state.home = action.payload;
        },
        setAddLabel: (state: AlbumsState, action: PayloadAction<Label>) => {
            state.home.push(action.payload);
        },
        setDeleteLabel: (state: AlbumsState, action: PayloadAction<string>) => {
            state.home = state.home.filter(label => label.name !== action.payload);
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
        setNeedDefaults: (state: AlbumsState, action: PayloadAction<boolean>) => {
            state.needDefaults = action.payload;
        },
    },
});

export default slice;

export const { setInitLabels, setAddLabel, setDeleteLabel, setSaved, setSortOrder, setSearched, clearSearched, setNeedDefaults } = slice.actions;