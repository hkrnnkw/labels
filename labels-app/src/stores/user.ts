import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirebaseUser, Spotify, SignedIn } from "../utils/types";
import firebase from '../firebase';

type UserState = SignedIn & FirebaseUser & Spotify;

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
        setFirebaseUser: (state: UserState, action: PayloadAction<firebase.User>) => {
            const { uid, displayName, email, photoURL, refreshToken, emailVerified } = action.payload;
            state.uid = uid;
            state.displayName = displayName || uid;
            state.email = email || '';
            state.photoURL = photoURL;
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

export const { setSignInStatus, setFirebaseUser, setSpotifyTokens, setClearUser } = slice.actions;