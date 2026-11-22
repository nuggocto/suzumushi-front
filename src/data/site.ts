export const SITE = {
  name: "Suzumushi",
  version: "1.4.3",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.4.3",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  nixFlake: "github:nuggocto/suzumushi/v1.4.3",
  nixDocs: "https://github.com/nuggocto/suzumushi/blob/v1.4.3/docs/nix.md",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.4.3-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.4.3",
  checksum: "82e8b25819d4a0080e8d5933371fe8d76d882815363542c71670d0cd877eb04e",
  installerChecksum: "5273bad4e39b0efe6b8bb1e9e1dca22c59f24c2b33ff1e0be601fc461eac8163",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
