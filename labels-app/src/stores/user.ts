import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
    uid: string,
    signedIn: boolean,
    refreshToken: string,
    displayName: string,
    email: string,
    photoURL: string | null,
    emailVerified: boolean,
};

const initialState: UserState = {
    uid: '',
    signedIn: false,
    refreshToken: '',
    displayName: '',
    email: '',
    photoURL: null,
    emailVerified: false,
};

const slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserProfile: (state: UserState, action: PayloadAction<UserState>) => {
            return Object.assign({}, state, {
                uid: action.payload.uid,
                signedIn: action.payload.signedIn,
                refreshToken: action.payload.refreshToken,
                displayName: action.payload.displayName,
                email: action.payload.email,
                photoURL: action.payload.photoURL,
                emailVerified: action.payload.emailVerified,
            });
        },
    },
});

export default slice;

export const { setUserProfile } = slice.actions;