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

export interface Spotify {
    spotify: {
        token: string;
        expiresIn: string;
        refreshToken: string;
    },
}

type UserState = UserProfile & Auth & Spotify;

const initialState: UserState = {
    uid: '',
    signedIn: false,
    refreshToken: '',
    displayName: '',
    email: '',
    photoURL: null,
    emailVerified: false,
    spotify: {
        token: '',
        expiresIn: '',
        refreshToken: '',
    },
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
        setSpotifyTokens: (state: UserState, action: PayloadAction<Spotify>) => {
            const { spotify } = action.payload;
            state.spotify = spotify;
        },
        setClearUser: () => {
            return initialState;
        },
    },
});

export default slice;

export const { setUserProfile, setAuth, setSpotifyTokens, setClearUser } = slice.actions;