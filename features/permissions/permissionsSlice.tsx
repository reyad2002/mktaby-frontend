import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  permissions: {
    id: 0,
    name: "",
    createdAt: "",
    documentPermissions: 0,
    clientPermissions: 0,
    sessionPermission: 0,
    financePermission: 0,
    viewCasePermissions: 0,
    dmlCasePermissions: 0,
    viewTaskPermissions: 0,
    dmlTaskPermissions: 0,
  },
};
const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setPermissions(state, action) {
      state.permissions = action.payload;
    },
  },
});

export const { setPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
