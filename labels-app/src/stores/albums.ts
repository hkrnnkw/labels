import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';
import { Home, SortOrder } from "../utils/types";

type AlbumsState = {
    home: Home[];
    saved: Album[];
    sortOrder: SortOrder;
}

const initialState: AlbumsState = {
    home: [],
    saved: [],
    sortOrder: 'DateDesc',
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setAddLabel: (state: AlbumsState, action: PayloadAction<Home>) => {
            state.home.push(action.payload);
        },
        setDeleteLabel: (state: AlbumsState, action: PayloadAction<string>) => {
            const newArray = state.home.filter(label => label.name !== action.payload);
            state.home = newArray;
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

export const { setAddLabel, setDeleteLabel, setHome, setSaved } = slice.actions;