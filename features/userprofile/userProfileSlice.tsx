import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: 0,
  name: "",
  email: "",
  phoneNumber: "",
  officeName: "",
  createdAt: "",
  role: "",
  imageURL: "",
  userPermissionId: 0,
  userPermissionName: "",
};
const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    setUserProfile(state, action) {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phoneNumber = action.payload.phoneNumber;
      state.officeName = action.payload.officeName;
      state.createdAt = action.payload.createdAt;
      state.role = action.payload.role;
      state.imageURL = action.payload.imageURL;
      state.userPermissionId = action.payload.userPermissionId;
      state.userPermissionName = action.payload.userPermissionName;
    },
  },
});
export const { setUserProfile } = userProfileSlice.actions;

// Selector to get user role
export const selectUserRole = (state: { userProfile: typeof initialState }) =>
  state.userProfile.role;

export const selectUserProfile = (state: {
  userProfile: typeof initialState;
}) => state.userProfile;

export default userProfileSlice.reducer;
