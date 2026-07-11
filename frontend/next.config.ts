import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const repoName = 'LLM-Working-Simulator-Platform';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,           // GitHub Pages needs /page/ not /page
  basePath: isGithubActions ? `/${repoName}` : '',
  assetPrefix: isGithubActions ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
