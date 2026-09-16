import type { NextConfig } from "next";

/** Set in CI when building for GitHub Pages project site. */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "household-tracker";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  ...(isGithubPages
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

export default nextConfig;
