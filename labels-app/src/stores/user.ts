import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
    name: string,
};

const initialState: UserState = {
    name: '',
};

const slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setName: (state: UserState, action: PayloadAction<string>) => {
            return Object.assign({}, state, { name: action.payload })
        },
        clearName: state => {
            return Object.assign({}, state, { name: "" })
        },
    }
});

export default slice;

export const { setName, clearName } = slice.actions;