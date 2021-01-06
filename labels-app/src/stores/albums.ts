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

// （大文字・小文字を区別せず）レーベル名でソート
const sortLabelName = (array: FavLabel[], desc: boolean = false): FavLabel[] => {
    return array.sort((a: FavLabel, b: FavLabel) => {
        const aa = a.labelName.toLowerCase(), bb = b.labelName.toLowerCase();
        return desc ?
            (aa > bb ? -1 : aa < bb ? 1 : 0)    // 降順
            :
            (aa < bb ? -1 : aa > bb ? 1 : 0);   // 昇順
    })
};

const slice = createSlice({
    name: "albums",
    initialState,
    reducers: {
        setLabelList: (state: AlbumsState, action: PayloadAction<FavLabel[]>) => {
            state.favLabels = sortLabelName(action.payload);
        },
        setAddLabel: (state: AlbumsState, action: PayloadAction<FavLabel>) => {
            state.favLabels.push(action.payload);
            state.favLabels = sortLabelName(state.favLabels);
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