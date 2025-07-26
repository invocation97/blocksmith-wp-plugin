import { Button, PanelBody } from "@wordpress/components";
import { PluginSidebar } from "@wordpress/editor";
import { useState } from "@wordpress/element";
import React from "react";
import { generateBlock } from "../../lib/utils/generateBlock";

export const Sidebar = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const title = wp.data
        .select("core/editor")
        .getEditedPostAttribute("title");
      const content = wp.data.select("core/editor").getEditedPostContent();

      if (!title || !content) {
        throw new Error("Please add a title and content to your post first");
      }

      const result = await generateBlock({
        title,
        content,
      });

      if (!result) {
        throw new Error(
          "Failed to generate block. Please check your API key configuration in the Blocksmith admin."
        );
      }

      wp.data
        .dispatch("core/editor")
        .insertBlocks(wp.blocks.parse(result.blockContent));

      setResponse("✅ Block generated and inserted successfully!");
    } catch (e: any) {
      setResponse(`❌ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PluginSidebar name="blocksmith-sidebar" title="Blocksmith">
      <PanelBody title="Generate Block from Post">
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
          Generate a custom block based on your post title and content. Make
          sure your API key is configured in the Blocksmith admin panel.
        </p>

        <Button
          isBusy={loading}
          onClick={handleGenerate}
          variant="primary"
          style={{ marginBottom: "10px" }}
        >
          {loading ? "Generating..." : "Generate Block"}
        </Button>

        {response && (
          <div
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: response.includes("✅") ? "#d4edda" : "#f8d7da",
              color: response.includes("✅") ? "#155724" : "#721c24",
              border: `1px solid ${
                response.includes("✅") ? "#c3e6cb" : "#f5c6cb"
              }`,
            }}
          >
            {response}
          </div>
        )}
      </PanelBody>
    </PluginSidebar>
  );
};
