#!/usr/bin/env node
const prompts = require("prompts");
const fs = require("fs");
const path = require("path");

(async () => {
  const response = await prompts({
    type: "text",
    name: "path",
    message: "Please enter the path you want to save the stickers to:",
    validate: (value) =>
      fs.existsSync(value) || "Please enter a valid directory.",
  });

  console.log(__dirname);
  fs.writeFileSync(
    path.join(__dirname, ".youtubeStickersDownloader"),
    response.path
  );
})();
