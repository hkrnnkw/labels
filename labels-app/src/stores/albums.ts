import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';

type AlbumsState = {
    followingLabels: string[];
    home: Album[][];
    saved: Album[];
}

const initialState: AlbumsState = {
    followingLabels: [],
    home: [],
    saved: [],
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setFollowingLabels: (state: AlbumsState, action: PayloadAction<string[]>) => {
            state.followingLabels = action.payload;
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

export const { setFollowingLabels, setHome, setSaved, setClearAlbums } = slice.actions;