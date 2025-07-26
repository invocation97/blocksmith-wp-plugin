import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { AdminAppState } from "../lib/types";
import { apiClient } from "../lib/utils/api";

const apiKeySchema = z.object({
  api_key: z.string().min(1, "API key is required"),
});

type ApiKeySchema = z.infer<typeof apiKeySchema>;

const AdminApp = () => {
  const [state, setState] = useState<AdminAppState>({
    api_key: blocksmithData?.api_key || "",
    status: "",
    isConnected: false,
    isLoading: false,
  });

  const form = useForm<ApiKeySchema>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      api_key: state.api_key,
    },
  });

  // Check connection status on load
  useEffect(() => {
    if (state.api_key) {
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      status: "Checking connection...",
    }));

    const result = await apiClient.testConnection();

    if (result.success) {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        status: "✅ Connected to Blocksmith",
      }));
    } else {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        status: `❌ Connection failed: ${result.data.message}`,
      }));
    }
  };

  const onSaveApiKey = async (data: ApiKeySchema): Promise<void> => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      status: "Saving API key...",
    }));

    const result = await apiClient.saveApiKey(data.api_key);

    if (result.success) {
      setState((prev) => ({
        ...prev,
        api_key: data.api_key,
        isConnected: true,
        isLoading: false,
        status: "✅ API key saved and validated successfully!",
      }));
    } else {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        status: `❌ Failed to save API key: ${result.data.message}`,
      }));
    }
  };

  const onRemoveApiKey = async () => {
    if (
      !confirm(
        "Are you sure you want to remove the API key? This will disconnect your site from Blocksmith."
      )
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      status: "Removing API key...",
    }));

    const result = await apiClient.removeApiKey();

    if (result.success) {
      setState({
        api_key: "",
        isConnected: false,
        isLoading: false,
        status: "✅ API key removed successfully",
      });
      form.setValue("api_key", "");
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        status: `❌ Failed to remove API key: ${result.data.message}`,
      }));
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "#1e1e1e", marginBottom: "0.5rem" }}>
          Blocksmith Configuration
        </h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          Connect your WordPress site to Blocksmith using your API key. Get your
          API key from your{" "}
          <a
            href="http://localhost:3000/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0073aa" }}
          >
            Blocksmith Dashboard
          </a>
          .
        </p>
      </div>

      {/* Site Information */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "6px",
          marginBottom: "1.5rem",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ marginBottom: "1rem", color: "#1e1e1e" }}>
          Site Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            fontSize: "14px",
          }}
        >
          <div>
            <strong>Site URL:</strong>{" "}
            <code
              style={{
                background: "#f0f0f0",
                padding: "2px 6px",
                borderRadius: "3px",
              }}
            >
              {blocksmithData.site_url}
            </code>
          </div>
          <div>
            <strong>Plugin Version:</strong>{" "}
            <code
              style={{
                background: "#f0f0f0",
                padding: "2px 6px",
                borderRadius: "3px",
              }}
            >
              {blocksmithData.plugin_version}
            </code>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div
        style={{
          backgroundColor: state.isConnected ? "#d4edda" : "#f8d7da",
          color: state.isConnected ? "#155724" : "#721c24",
          padding: "1rem",
          borderRadius: "6px",
          marginBottom: "1.5rem",
          border: `1px solid ${state.isConnected ? "#c3e6cb" : "#f5c6cb"}`,
        }}
      >
        <strong>Status:</strong>{" "}
        {state.status ||
          (state.api_key
            ? "Ready to test connection"
            : "No API key configured")}
      </div>

      {/* API Key Configuration */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "6px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ marginBottom: "1rem", color: "#1e1e1e" }}>
          API Key Configuration
        </h3>

        <form
          onSubmit={form.handleSubmit(onSaveApiKey)}
          style={{ marginBottom: "1rem" }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="api_key"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              API Key:
            </label>
            <input
              id="api_key"
              type="text"
              placeholder="Enter your Blocksmith API key"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "monospace",
              }}
              disabled={state.isLoading}
              {...form.register("api_key")}
            />
            {form.formState.errors.api_key && (
              <p
                style={{
                  color: "#d63384",
                  fontSize: "14px",
                  marginTop: "0.25rem",
                }}
              >
                {form.formState.errors.api_key.message}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={state.isLoading}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#0073aa",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: state.isLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {state.isLoading ? "Saving..." : "Save & Test API Key"}
            </button>

            {state.api_key && (
              <button
                type="button"
                onClick={checkConnection}
                disabled={state.isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: state.isLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {state.isLoading ? "Testing..." : "Test Connection"}
              </button>
            )}

            {state.api_key && (
              <button
                type="button"
                onClick={onRemoveApiKey}
                disabled={state.isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: state.isLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Remove API Key
              </button>
            )}
          </div>
        </form>

        {/* Help Text */}
        <div
          style={{
            fontSize: "14px",
            color: "#666",
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "4px",
            border: "1px solid #e9ecef",
          }}
        >
          <h4 style={{ marginBottom: "0.5rem", color: "#495057" }}>
            How to get your API key:
          </h4>
          <ol style={{ marginBottom: "0", paddingLeft: "1.5rem" }}>
            <li>
              Log in to your{" "}
              <a
                href="http://localhost:3000/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0073aa" }}
              >
                Blocksmith Dashboard
              </a>
            </li>
            <li>Navigate to the WordPress section</li>
            <li>
              Enter your site URL:{" "}
              <code
                style={{
                  background: "#fff",
                  padding: "1px 4px",
                  borderRadius: "2px",
                }}
              >
                {blocksmithData.site_url}
              </code>
            </li>
            <li>Copy the generated API key and paste it above</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminApp;
