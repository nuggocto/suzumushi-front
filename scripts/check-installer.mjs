// The site serves the latest release's install.sh; refuse to publish any other bytes.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { RELEASE, SITE } from "../src/data/site.ts";

const script = await readFile(new URL("../dist/install.sh", import.meta.url));
const actual = createHash("sha256").update(script).digest("hex");
if (actual !== RELEASE.installerChecksum) {
  throw new Error(
    `install.sh SHA-256 ${actual} differs from the reviewed ${RELEASE.installerChecksum}`,
  );
}
if (
  !script.includes(`version='${SITE.version}'`) ||
  !script.includes(`expected='${RELEASE.checksum}'`)
) {
  throw new Error(`install.sh does not install the ${SITE.version} archive`);
}
if (!script.toString("utf8").trimEnd().endsWith('main "$@"')) {
  throw new Error("install.sh must call main only on its last line");
}
console.log(`install.sh matches release ${SITE.version}.`);
