import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, role, login, logout } = useAuthContext();

  return {
    isAuthenticated: !!user,
    user,
    role,
    login,
    logout,
  };
}
