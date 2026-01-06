"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/authTokens";
import { getCurrentUser } from "@/features/users/apis/usersApi";
import { getPermissionById } from "@/features/permissions/apis/permissionsApi";
import { setUserProfile } from "@/features/userprofile/userProfileSlice";
import { setPermissions } from "@/features/permissions/permissionsSlice";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Check for token
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!getAccessToken(),
  });

  // Fetch user permissions
  const { data: permissionData } = useQuery({
    queryKey: ["permission", userData?.data?.userPermissionId],
    queryFn: () => getPermissionById(userData!.data!.userPermissionId),
    enabled: !!userData?.data?.userPermissionId,
  });
  console.log("Fetched Permissions Data:", permissionData);
  // Store user profile in Redux
  useEffect(() => {
    if (userData?.data) {
      dispatch(setUserProfile(userData.data));
    }
  }, [userData, dispatch]);

  // Store permissions in Redux
  useEffect(() => {
    if (permissionData) {
      dispatch(setPermissions(permissionData));
    }
  }, [permissionData, dispatch]);

  // Return children directly - redirect happens in useEffect
  return <>{children}</>;
}
