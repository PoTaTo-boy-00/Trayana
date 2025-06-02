import fs from "fs";

const raw = fs.readFileSync(
  "google-cloud\\swift-surf-454203-c1-6471ee8470fa.json",
  "utf8"
);
const escaped = raw.replace(/\n/g, "\\n");
console.log(escaped);
