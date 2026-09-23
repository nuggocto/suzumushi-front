export const SITE = {
  name: "Suzumushi",
  version: "1.1.6",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.1.6",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  nixFlake: "github:nuggocto/suzumushi/v1.1.6",
  nixDocs: "https://github.com/nuggocto/suzumushi/blob/v1.1.6/docs/nix.md",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.1.6-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.1.6",
  checksum: "88f59ccf9699c750fef57b8e661ebbad483f97fd4f4b7b2f021dd5af61f350e7",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
