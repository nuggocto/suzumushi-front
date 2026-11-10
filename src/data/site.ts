export const SITE = {
  name: "Suzumushi",
  version: "1.3.0",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.3.0",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  nixFlake: "github:nuggocto/suzumushi/v1.3.0",
  nixDocs: "https://github.com/nuggocto/suzumushi/blob/v1.3.0/docs/nix.md",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.3.0-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.3.0",
  checksum: "f60822d2537e8c2e9174e04f9070da60f6f78a895036ae92e520d5e39a317c15",
  installerChecksum: "d11321d83a9ba5e9a58951296cd3c010e0ee60fec7f15c7a212d20f949c8573f",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
