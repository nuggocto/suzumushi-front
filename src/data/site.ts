export const SITE = {
  name: "Suzumushi",
  version: "1.4.2",
  domain: "suzumushi.org",
  description: "A calm, fully local terminal audio player for Linux.",
  github: "https://github.com/nuggocto/suzumushi",
  release: "https://github.com/nuggocto/suzumushi/releases/tag/v1.4.2",
  aur: "https://aur.archlinux.org/packages/suzumushi-bin",
  nixFlake: "github:nuggocto/suzumushi/v1.4.2",
  nixDocs: "https://github.com/nuggocto/suzumushi/blob/v1.4.2/docs/nix.md",
  license: "https://github.com/nuggocto/suzumushi/blob/shrek/LICENSE",
} as const;

export const RELEASE = {
  archive: "suzumushi-v1.4.2-x86_64-unknown-linux-gnu.tar.xz",
  baseUrl: "https://github.com/nuggocto/suzumushi/releases/download/v1.4.2",
  checksum: "827dbc10b0a897c680c79d3cbf9b7d8f9e4e364f2a01a737adc0701f25d69077",
  installerChecksum: "7fe596db3fa07fcf8204ca44f154d306e21138ccfb400a062d8e8022d30aa8e3",
} as const;

export const NAV = [
  { href: "/#player", label: "Player" },
  { href: "/install", label: "Install" },
  { href: "/changelog", label: "Changelog" },
] as const;
