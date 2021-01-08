import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';
import { Label, Home, SortOrder } from "../utils/types";

type AlbumsState = {
    favLabels: Label[];
    home: Home[];
    saved: Album[];
    sortOrder: SortOrder;
}

const initialState: AlbumsState = {
    favLabels: [],
    home: [],
    saved: [],
    sortOrder: 'DateDesc',
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setLabelList: (state: AlbumsState, action: PayloadAction<Label[]>) => {
            state.favLabels = action.payload;
        },
        setAddLabel: (state: AlbumsState, action: PayloadAction<Label>) => {
            state.favLabels.push(action.payload);
        },
        setDeleteLabel: (state: AlbumsState, action: PayloadAction<string>) => {
            const newArray = state.favLabels.filter(label => label.name !== action.payload);
            state.favLabels = newArray;
        },
        setHome: (state: AlbumsState, action: PayloadAction<Home[]>) => {
            state.home = action.payload;
        },
        setSaved: (state: AlbumsState, action: PayloadAction<Album[]>) => {
            state.saved = action.payload;
        },
    },
});

export default slice;

export const { setLabelList, setAddLabel, setDeleteLabel, setHome, setSaved } = slice.actions;