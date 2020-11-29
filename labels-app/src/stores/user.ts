import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
    uid: string,
    signedIn: boolean,
    refreshToken: string,
    displayName: string,
    email: string,
    photoURL: string | null,
};

const initialState: UserState = {
    uid: '',
    signedIn: false,
    refreshToken: '',
    displayName: '',
    email: '',
    photoURL: null,
};

const slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setAuth: (state: UserState, action: PayloadAction<UserState>) => {
            return Object.assign({}, state, {
                uid: action.payload.uid,
                signedIn: action.payload.signedIn,
                refreshToken: action.payload.refreshToken,
            });
        },
        setProfile: (state: UserState, action: PayloadAction<UserState>) => {
            return Object.assign({}, state, {
                displayName: action.payload.displayName,
                email: action.payload.email,
                photoURL: action.payload.photoURL,
            });
        },
    },
});

export default slice;

export const { setAuth, setProfile } = slice.actions;