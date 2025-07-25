import { registerPlugin } from "@wordpress/plugins";
import React from "react";
import { Sidebar } from "./editor/components/Sidebar";

// Import your editor components here
// import { EditorComponent } from './components/EditorComponent';

// Register the editor plugin
registerPlugin("blocksmith-editor", {
  render: () => {
    return <Sidebar />;
  },
  icon: "editor-code",
});
