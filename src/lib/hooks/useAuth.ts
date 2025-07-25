import { useEffect, useState } from "react";
import { API_URL } from "../utils/constants";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("blocksmith_token", data.token);
      setToken(data.token);
    } else {
      throw new Error(data.error || "Login Failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("blocksmith_token");
    setToken(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("blocksmith_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return { token, login, logout };
}
