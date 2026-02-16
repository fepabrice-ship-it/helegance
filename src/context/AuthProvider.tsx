import React, { useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      console.log("Checking admin status for:", userId);
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found, which is fine
        console.error("Admin check query error:", error);
      }

      const isUserAdmin = !!data && !error;
      console.log("Admin check result:", isUserAdmin);
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (err) {
      console.error("Admin check exception:", err);
      setIsAdmin(false);
      return false;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    console.log("Initializing Auth...");

    const initAuth = async () => {
      try {
        // 1. Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log("Session restored from storage for:", session.user.email);
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        } else {
          console.log("No initial session found.");
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
        console.log("Auth initialization complete. Loading:", false);
      }
    };

    initAuth();

    // Listen for changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
