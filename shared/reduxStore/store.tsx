import { configureStore } from "@reduxjs/toolkit";
import userProfileReducer from "../../features/userprofile/userProfileSlice";
 export const store = configureStore({
   reducer: {
        userProfile: userProfileReducer,
   },
 });