import { Button, PanelBody } from "@wordpress/components";
import { PluginSidebar } from "@wordpress/editor";
import { useState } from "@wordpress/element";
import React from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import { generateBlock } from "../../lib/utils/generateBlock";

export const Sidebar = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const { token, login } = useAuth();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const title = wp.data
        .select("core/editor")
        .getEditedPostAttribute("title");
      const content = wp.data.select("core/editor").getEditedPostContent();

      const result = await generateBlock(token!, {
        title,
        content,
      });

      if (!result) {
        throw new Error("Failed to generate block");
      }

      wp.data
        .dispatch("core/editor")
        .insertBlocks(wp.blocks.parse(result.blockContent));

      setResponse("Block inserted!");
    } catch (e: any) {
      setResponse(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PluginSidebar name="blocksmith-sidebar" title="Blocksmith">
      <PanelBody title="Generate block">
        <Button isBusy={loading} onClick={handleGenerate} variant="primary">
          Generate from Post
        </Button>
        {response && <p style={{ marginTop: "10px" }}>{response}</p>}
      </PanelBody>
    </PluginSidebar>
  );
};
