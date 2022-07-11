import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from "./store";

export interface AppErrorInterface {
    code?: string,
    header?: string,
    message?: string,
    stack?: string,
}

interface AppStateInterface {
    appState?: string | undefined,
    appError?: AppErrorInterface,
}

const initialState: AppStateInterface = {
    appState: 'initial state',
};

export const appSlice = createSlice({
        name: 'app',
        initialState,
        reducers: {
            setAppState: (state, action: PayloadAction<string | undefined>) => {
                state.appState = action.payload;
            },
            setAppError: (state, action: PayloadAction<AppErrorInterface>) => {
                console.log('AppError changed:');
                console.log(action.payload);
                state.appError = action.payload;
            },
        }
    }
);

// === actions
export const {
    setAppState,
    setAppError,
} = appSlice.actions;

// === selectors
export const selectAppState = (state: RootState) => (state.app.appState);
export const selectError = (state: RootState) => (state.app.appError);

export const appReducer = appSlice.reducer;