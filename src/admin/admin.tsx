import React from "react";
import ReactDOM from "react-dom";
import AdminApp from "./AdminApp";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("blocksmith-admin-root");
  if (container) ReactDOM.render(<AdminApp />, container);
});
