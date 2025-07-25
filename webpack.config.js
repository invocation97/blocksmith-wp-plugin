const path = require("path");

module.exports = {
  ...require("@wordpress/scripts/config/webpack.config"),
  entry: {
    editor: path.resolve(__dirname, "src/editor.tsx"),
    admin: path.resolve(__dirname, "src/admin/admin.tsx"),
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
    clean: true,
  },
};
