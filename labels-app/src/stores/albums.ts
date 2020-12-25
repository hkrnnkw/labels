import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Album } from '../utils/interfaces';

type AlbumsState = {
    guestHome: Album[][];
    privateHome: Album[][];
    search: Album[];
}

const initialState: AlbumsState = {
    guestHome: [],
    privateHome: [],
    search: [],
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setGuestHome: (state: AlbumsState, action: PayloadAction<Album[][]>) => {
            state.guestHome = action.payload;
        },
        setPrivateHome: (state: AlbumsState, action: PayloadAction<Album[][]>) => {
            state.privateHome = action.payload;
        },
        setSearch: (state: AlbumsState, action: PayloadAction<Album[]>) => {
            state.search = action.payload;
        },
        setClearAlbums: () => {
            return initialState;
        },
    },
});

export default slice;

export const { setGuestHome, setPrivateHome, setSearch, setClearAlbums } = slice.actions;