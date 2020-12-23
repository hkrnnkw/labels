import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "../utils/interfaces";
import { Auth, Spotify } from "../utils/types";

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