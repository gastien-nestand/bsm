import { useSession, signOut } from "next-auth/react";
import { useCallback } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { data: session, status } = useSession();
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  const user = session?.user ? {
    id: parseInt((session.user as any).id || "0"),
    name: session.user.name,
    email: session.user.email,
    role: (session.user as any).role,
  } : null;

  return {
    user,
    loading: status === "loading",
    error: null,
    isAuthenticated: !!session,
    refresh: () => { },
    logout,
  };
}
