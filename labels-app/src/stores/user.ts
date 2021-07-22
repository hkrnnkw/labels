import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "../utils/interfaces";
import { Auth, Spotify, SignedIn } from "../utils/types";

type UserState = SignedIn & UserProfile & Auth & Spotify;

const initialState: UserState = {
    uid: '',
    signedIn: undefined,
    refreshToken: '',
    displayName: '',
    email: '',
    photoURL: null,
    emailVerified: false,
    spotify: {
        token: '',
        expiresIn: -1,
    },
};

const slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setSignInStatus: (state: UserState, action: PayloadAction<boolean>) => {
            state.signedIn = action.payload;
        },
        setUserProfile: (state: UserState, action: PayloadAction<UserProfile>) => {
            const { uid, displayName, email, photoURL } = action.payload;
            state.uid = uid;
            state.displayName = displayName;
            state.email = email;
            state.photoURL = photoURL;
        },
        setAuth: (state: UserState, action: PayloadAction<Auth>) => {
            const { refreshToken, emailVerified } = action.payload;
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

export const { setSignInStatus, setUserProfile, setAuth, setSpotifyTokens, setClearUser } = slice.actions;