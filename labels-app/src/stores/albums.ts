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
        setFollowingLabels: (state: AlbumsState, action: PayloadAction<string | string[]>) => {
            if (typeof action.payload !== 'string') {
                state.followingLabels = action.payload;
                return;
            }
            const isFollowing: boolean = state.followingLabels.includes(action.payload);
            if (isFollowing) {
                const newArray = state.followingLabels.filter(label => label !== action.payload);
                state.followingLabels = newArray;
            } else {
                state.followingLabels.push(action.payload);
            }
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