import { configureStore } from "@reduxjs/toolkit";
import userProfileReducer from "../../features/userprofile/userProfileSlice";
import permissionsReducer from "../../features/permissions/permissionsSlice";

export const store = configureStore({
  reducer: {
    userProfile: userProfileReducer,
    permissions: permissionsReducer,
  },
});

// Infer the `RootState` type from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
