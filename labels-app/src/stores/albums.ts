import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';
import { FavLabel } from "../utils/types";

type AlbumsState = {
    favLabels: FavLabel[];
    home: Album[][];
    saved: Album[];
}

const initialState: AlbumsState = {
    favLabels: [],
    home: [],
    saved: [],
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setLabelList: (state: AlbumsState, action: PayloadAction<FavLabel[]>) => {
            state.favLabels = action.payload;
        },
        setAddLabel: (state: AlbumsState, action: PayloadAction<FavLabel>) => {
            state.favLabels.push(action.payload);
        },
        setDeleteLabel: (state: AlbumsState, action: PayloadAction<string>) => {
            const newArray = state.favLabels.filter(label => label.labelName !== action.payload);
            state.favLabels = newArray;
        },
        setHome: (state: AlbumsState, action: PayloadAction<Album[][]>) => {
            state.home = action.payload;
        },
        setSaved: (state: AlbumsState, action: PayloadAction<Album[]>) => {
            state.saved = action.payload;
        },
    },
});

export default slice;

export const { setLabelList, setAddLabel, setDeleteLabel, setHome, setSaved } = slice.actions;