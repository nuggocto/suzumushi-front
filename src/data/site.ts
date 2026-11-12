export const SITE = {
  name: "Suzumushi",
  version: "1.4.0",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.4.0",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  nixFlake: "github:nuggocto/suzumushi/v1.4.0",
  nixDocs: "https://github.com/nuggocto/suzumushi/blob/v1.4.0/docs/nix.md",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.4.0-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.4.0",
  checksum: "5d839d62ceb4279e13f21af2acd29f5be90f96f0233cfbad8f9afdaf20cccf1e",
  installerChecksum: "37b45b29dbfc16f3184a8d48c9d392fb683e412f5cf941b6617d74e251d06463",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
