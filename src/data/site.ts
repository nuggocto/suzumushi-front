export const SITE = {
  name: "Suzumushi",
  version: "1.1.8",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.1.8",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  nixFlake: "github:nuggocto/suzumushi/v1.1.8",
  nixDocs: "https://github.com/nuggocto/suzumushi/blob/v1.1.8/docs/nix.md",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.1.8-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.1.8",
  checksum: "aa08bbefc6d534a82f6f1e5a114c19df1ea1d1db033982a1071a9775f3d0027c",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
