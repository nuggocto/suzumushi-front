export const SITE = {
  name: "Suzumushi",
  version: "1.4.1",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.4.1",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  nixFlake: "github:nuggocto/suzumushi/v1.4.1",
  nixDocs: "https://github.com/nuggocto/suzumushi/blob/v1.4.1/docs/nix.md",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.4.1-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.4.1",
  checksum: "31953d73269c1778a178096849056213f4056cb5a27df0de6a049fb4ea740e5d",
  installerChecksum: "8a9928ed2121dc3acf68186cd610f7c61a2d8201fc8795ee5bcb0dd8efb69fd1",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
