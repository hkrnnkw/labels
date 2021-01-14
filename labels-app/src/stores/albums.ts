import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';
import { Label, SortOrder } from "../utils/types";

type AlbumsState = {
    home: Label;
    saved: Album[];
    sortOrder: SortOrder;
}

const initialState: AlbumsState = {
    home: {},
    saved: [],
    sortOrder: null,
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
            
            // フォローが無くなったら、sortOrderをnullにする
            if (!Object.keys(state.home).length) state.sortOrder = null;
        },
        setSaved: (state: AlbumsState, action: PayloadAction<Album[]>) => {
            state.saved = action.payload;
        },
        setSortOrder: (state: AlbumsState, action: PayloadAction<SortOrder>) => {
            state.sortOrder = action.payload;
        },
    },
});

export default slice;

export const { setAddLabel, setDeleteLabel, setSaved, setSortOrder } = slice.actions;