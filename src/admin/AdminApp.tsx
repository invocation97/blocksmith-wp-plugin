import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { LoginResponse } from "../lib/types";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type LoginSchema = z.infer<typeof loginSchema>;

const AdminApp = () => {
  const [token, setToken] = useState<string | null>(
    blocksmithData?.token || null
  );
  const [status, setStatus] = useState("");

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema): Promise<void> => {
    setStatus("Logging in...");
    const formData = new FormData();
    formData.append("action", "blocksmith_login");
    formData.append("email", data.email);
    formData.append("password", data.password);

    const res = await fetch(blocksmithData.ajax_url, {
      method: "POST",
      body: formData,
    });

    const json: LoginResponse = await res.json();
    if (json.success && json.data && "token" in json.data) {
      setToken(json.data.token);
      setStatus("Authenticated successfully!");
    } else if (!json.success && json.data && "message" in json.data) {
      setStatus(json.data.message);
    } else {
      setStatus("Login failed.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Blocksmith Admin</h2>
      {token ? (
        <>
          <p>✅ Authenticated</p>
          <p>
            <strong>Token:</strong> {token}
          </p>
        </>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <input
            type="email"
            placeholder="Email"
            style={{ display: "block", marginBottom: 10 }}
            autoComplete="email"
            {...form.register("email")}
          />
          <input
            type="password"
            placeholder="Password"
            style={{ display: "block", marginBottom: 10 }}
            autoComplete="current-password"
            {...form.register("password")}
          />
          <button type="submit">Login</button>
          <p>{status}</p>
        </form>
      )}
    </div>
  );
};

export default AdminApp;
