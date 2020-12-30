import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';

type AlbumsState = {
    labels: string[];
    home: Album[][];
    saved: Album[];
}

const initialState: AlbumsState = {
    labels: [],
    home: [],
    saved: [],
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setLabels: (state: AlbumsState, action: PayloadAction<string[]>) => {
            state.labels = action.payload;
        },
        setHome: (state: AlbumsState, action: PayloadAction<Album[][]>) => {
            state.home = action.payload;
        },
        setSaved: (state: AlbumsState, action: PayloadAction<Album[]>) => {
            state.saved = action.payload;
        },
        setClearAlbums: () => {
            return initialState;
        },
    },
});

export default slice;

export const { setLabels, setHome, setSaved, setClearAlbums } = slice.actions;