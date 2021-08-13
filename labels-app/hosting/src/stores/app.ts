import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AppState = {
    isProcessing: boolean;
}

const initialState: AppState = {
    isProcessing: false,
};

const slice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        switchIsProcessing: (state: AppState, action: PayloadAction<boolean>) => {
            state.isProcessing = action.payload;
        },
    },
});

export default slice;

export const { switchIsProcessing } = slice.actions;