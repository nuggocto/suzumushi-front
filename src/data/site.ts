export const SITE = {
  name: "Suzumushi",
  version: "1.1.1",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.1.1",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.1.1-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.1.1",
  checksum: "791e9b168986015c560a8c02f2650f314837253145ad8d4cd89f5c4d210e3c8b",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
