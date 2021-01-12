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
    sortOrder: 'DateDesc',
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setAddLabel: (state: AlbumsState, action: PayloadAction<Label>) => {
            state.home = {...state.home, ...action.payload};
        },
        setDeleteLabel: (state: AlbumsState, action: PayloadAction<string>) => {
            delete state.home[action.payload];
        },
        setSaved: (state: AlbumsState, action: PayloadAction<Album[]>) => {
            state.saved = action.payload;
        },
    },
});

export default slice;

export const { setAddLabel, setDeleteLabel, setSaved } = slice.actions;