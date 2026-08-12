export const SITE = {
  name: "Suzumushi",
  version: "1.0.1",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.0.1",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.0.1-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.0.1",
  checksum: "237ab901efc3a8732d4d802fb7790e53cd70dab1725139ac7ac5a967cd4d2e64",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
