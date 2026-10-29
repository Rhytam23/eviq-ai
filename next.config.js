/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { dirs: ["app", "components", "lib", "tests"] },
};
module.exports = nextConfig;
