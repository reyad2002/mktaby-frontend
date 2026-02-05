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
    staleTime: 5 * 60 * 1000,
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-slate-300 border-t-teal-600 animate-spin" />
        </div>

        <p className="text-sm font-semibold text-slate-900">جاري التحقق</p>
        <p className="mt-1 text-xs text-slate-500">
          برجاء الانتظار لحظات
          <span className="inline-flex items-center gap-1 mr-2 align-middle">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
          </span>
        </p>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 bg-teal-600/60 animate-[loadingBar_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
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
