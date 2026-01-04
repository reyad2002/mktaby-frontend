import { createSlice } from "@reduxjs/toolkit";
import { PermissionDetail } from "./types/permissionTypes";

interface PermissionsState {
  permissions: PermissionDetail;
}

const initialState: PermissionsState = {
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
    setPermissions(state, action: { payload: PermissionDetail }) {
      state.permissions = action.payload;
    },
    clearPermissions(state) {
      state.permissions = initialState.permissions;
    },
  },
});

export const { setPermissions, clearPermissions } = permissionsSlice.actions;

// Selector to get current user permissions
export const selectUserPermissions = (state: {
  permissions: PermissionsState;
}) => state.permissions.permissions;

export default permissionsSlice.reducer;
