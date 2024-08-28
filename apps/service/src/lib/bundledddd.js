// src/bundled/siwe/esbuild-shims.ts
globalThis.require = (name) => {
  if (name === "ethers") {
    return ethers;
  }
  throw new Error("unknown module " + name);
};

// src/bundled/siwe/toBundle.ts
function bytesToHexString(bytes) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function generateRandomSeed() {
  const key = await crypto.getRandomValues(new Uint8Array(32));
  const hexString = bytesToHexString(key);
  return hexString;
}
var go = async () => {
  const seed = await generateRandomSeed();
  const combineKeys = await Lit.Actions.broadcastAndCollect({
    name: "combineKeys",
    value: seed
  });
  Lit.Actions.setResponse({ response: JSON.stringify(combineKeys.join("")) });
};
go();
