import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';

type AlbumsState = {
    home: Album[][];
    saved: Album[];
}

const initialState: AlbumsState = {
    home: [],
    saved: [],
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
        setClearAlbums: () => {
            return initialState;
        },
    },
});

export default slice;

export const { setHome, setSaved, setClearAlbums } = slice.actions;