#!/bin/bash
# Usage: patch-next.sh <appdir> <basePath>
set -e
cd "$1"
BP="$2"
ext=ts; [ -f next.config.mjs ] && ext=mjs; [ -f next.config.js ] && ext=js
mv next.config.$ext next.config.orig.$ext
cat > preview-image-loader.js <<JS
export default function loader({ src }) {
  return src.startsWith("/") && !src.startsWith("$BP/") ? "$BP" + src : src;
}
JS
if [ $ext = ts ]; then
cat > next.config.ts <<TS
import orig from "./next.config.orig";
const base: any = orig;
export default {
  ...base,
  basePath: "$BP",
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { ...(base.images || {}), loader: "custom", loaderFile: "./preview-image-loader.js" },
};
TS
else
cat > next.config.mjs <<JS
import orig from "./next.config.orig.$ext";
const base = orig;
export default {
  ...base,
  basePath: "$BP",
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { ...(base.images || {}), loader: "custom", loaderFile: "./preview-image-loader.js" },
};
JS
fi
