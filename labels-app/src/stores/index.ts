import { combineReducers, configureStore } from "@reduxjs/toolkit";
import UserModule from "./user";
import AlbumsModule from './albums';
 
const rootReducer = combineReducers({
    user: UserModule.reducer,
    albums: AlbumsModule.reducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
    reducer: rootReducer,
});
export type AppDispatch = typeof store.dispatch;
export default store;
