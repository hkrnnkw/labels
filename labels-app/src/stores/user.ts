import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
}

export interface Auth {
    signedIn: boolean;
    refreshToken: string;
    emailVerified: boolean;
}

export type UserState = UserProfile & Auth & {
    spotifyToken: string;
};

export const initialState: UserState = {
    uid: '',
    signedIn: false,
    refreshToken: '',
    displayName: '',
    email: '',
    photoURL: null,
    emailVerified: false,
    spotifyToken: '',
};

const slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserProfile: (state: UserState, action: PayloadAction<UserProfile>) => {
            const { uid, displayName, email, photoURL } = action.payload;
            state.uid = uid;
            state.displayName = displayName;
            state.email = email;
            state.photoURL = photoURL;
        },
        setAuth: (state: UserState, action: PayloadAction<Auth>) => {
            const { signedIn, refreshToken, emailVerified } = action.payload;
            state.signedIn = signedIn;
            state.refreshToken = refreshToken;
            state.emailVerified = emailVerified;
        },
        setSpotifyToken: (state: UserState, action: PayloadAction<string>) => {
            state.spotifyToken = action.payload;
        },
    },
});

export default slice;

export const { setUserProfile, setAuth, setSpotifyToken } = slice.actions;