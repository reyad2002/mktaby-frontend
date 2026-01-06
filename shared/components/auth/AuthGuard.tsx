"use client";

import { useEffect, useState, useRef } from "react";
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
  const [authStatus, setAuthStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");
  const hasChecked = useRef(false);

  // Check for token (runs only once)
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = getAccessToken();
    if (!token) {
      // Redirect to login without state update
      router.push("/auth/login");
    } else {
      // Use microtask to defer state update
      queueMicrotask(() => {
        setAuthStatus("authenticated");
      });
    }
  }, [router]);

  // Fetch current user (only if authenticated)
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: authStatus === "authenticated",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user permissions
  const { data: permissionData, isLoading: permLoading } = useQuery({
    queryKey: ["permission", userData?.data?.userPermissionId],
    queryFn: () => getPermissionById(userData!.data!.userPermissionId),
    enabled: !!userData?.data?.userPermissionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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

  // Show loading while checking auth or fetching data
  if (authStatus === "checking" || userLoading || permLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        جاري التحقق...
      </div>
    );
  }

  // Don't render children if not authenticated
  if (authStatus === "unauthenticated") {
    return null;
  }

  // Return children directly
  return <>{children}</>;
}
