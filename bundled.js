// src/bundled/encrypted-root-key/esbuild-shims.ts
globalThis.require = (name) => {
  if (name === "ethers") {
    return ethers;
  }
  throw new Error("unknown module " + name);
};

// https://esm.sh/v135/@noble/hashes@1.4.0/denonext/_assert.js
function r(e) {
  if (!Number.isSafeInteger(e) || e < 0) throw new Error(`positive integer expected, not ${e}`);
}
function f(e) {
  return e instanceof Uint8Array || e != null && typeof e == "object" && e.constructor.name === "Uint8Array";
}
function n(e, ...t) {
  if (!f(e)) throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(e.length)) throw new Error(`Uint8Array expected of length ${t}, not of length=${e.length}`);
}
function s(e) {
  if (typeof e != "function" || typeof e.create != "function") throw new Error("Hash should be wrapped by utils.wrapConstructor");
  r(e.outputLen), r(e.blockLen);
}
function u(e, t = true) {
  if (e.destroyed) throw new Error("Hash instance has been destroyed");
  if (t && e.finished) throw new Error("Hash#digest() has already been called");
}
function c(e, t) {
  n(e);
  let o3 = t.outputLen;
  if (e.length < o3) throw new Error(`digestInto() expects output buffer of length at least ${o3}`);
}

// https://esm.sh/v135/@noble/hashes@1.4.0/denonext/crypto.js
var o = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;

// https://esm.sh/v135/@noble/hashes@1.4.0/denonext/utils.js
var B = (t) => new DataView(t.buffer, t.byteOffset, t.byteLength);
var E = (t, e) => t << 32 - e | t >>> e;
var d = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
var w = Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
var i = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
function x(t) {
  if (t >= i._0 && t <= i._9) return t - i._0;
  if (t >= i._A && t <= i._F) return t - (i._A - 10);
  if (t >= i._a && t <= i._f) return t - (i._a - 10);
}
function V(t) {
  if (typeof t != "string") throw new Error("hex string expected, got " + typeof t);
  let e = t.length, o3 = e / 2;
  if (e % 2) throw new Error("padded hex string expected, got unpadded hex of length " + e);
  let n2 = new Uint8Array(o3);
  for (let r2 = 0, c2 = 0; r2 < o3; r2++, c2 += 2) {
    let p = x(t.charCodeAt(c2)), l2 = x(t.charCodeAt(c2 + 1));
    if (p === void 0 || l2 === void 0) {
      let g = t[c2] + t[c2 + 1];
      throw new Error('hex string expected, got non-hex character "' + g + '" at index ' + c2);
    }
    n2[r2] = p * 16 + l2;
  }
  return n2;
}
function m(t) {
  if (typeof t != "string") throw new Error(`utf8ToBytes expected string, got ${typeof t}`);
  return new Uint8Array(new TextEncoder().encode(t));
}
function s2(t) {
  return typeof t == "string" && (t = m(t)), n(t), t;
}
var y = class {
  clone() {
    return this._cloneInto();
  }
};
var L = {}.toString;
function C(t) {
  let e = (n2) => t().update(s2(n2)).digest(), o3 = t();
  return e.outputLen = o3.outputLen, e.blockLen = o3.blockLen, e.create = () => t(), e;
}

// https://esm.sh/v135/@noble/hashes@1.4.0/denonext/hmac.js
var o2 = class extends y {
  constructor(t, i2) {
    super(), this.finished = false, this.destroyed = false, s(t);
    let h2 = s2(i2);
    if (this.iHash = t.create(), typeof this.iHash.update != "function") throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
    let a = this.blockLen, s4 = new Uint8Array(a);
    s4.set(h2.length > a ? t.create().update(h2).digest() : h2);
    for (let e = 0; e < s4.length; e++) s4[e] ^= 54;
    this.iHash.update(s4), this.oHash = t.create();
    for (let e = 0; e < s4.length; e++) s4[e] ^= 106;
    this.oHash.update(s4), s4.fill(0);
  }
  update(t) {
    return u(this), this.iHash.update(t), this;
  }
  digestInto(t) {
    u(this), n(t, this.outputLen), this.finished = true, this.iHash.digestInto(t), this.oHash.update(t), this.oHash.digestInto(t), this.destroy();
  }
  digest() {
    let t = new Uint8Array(this.oHash.outputLen);
    return this.digestInto(t), t;
  }
  _cloneInto(t) {
    t || (t = Object.create(Object.getPrototypeOf(this), {}));
    let { oHash: i2, iHash: h2, finished: a, destroyed: s4, blockLen: e, outputLen: d3 } = this;
    return t = t, t.finished = a, t.destroyed = s4, t.blockLen = e, t.outputLen = d3, t.oHash = i2._cloneInto(t.oHash), t.iHash = h2._cloneInto(t.iHash), t;
  }
  destroy() {
    this.destroyed = true, this.oHash.destroy(), this.iHash.destroy();
  }
};
var l = (n2, t, i2) => new o2(n2, t).update(i2).digest();
l.create = (n2, t) => new o2(n2, t);

// https://esm.sh/v135/@noble/hashes@1.4.0/denonext/hkdf.js
function w2(t, o3, e) {
  return s(t), e === void 0 && (e = new Uint8Array(t.outputLen)), l(t, s2(e), s2(o3));
}
var s3 = new Uint8Array([0]);
var m2 = new Uint8Array();
function A(t, o3, e, n2 = 32) {
  if (s(t), r(n2), n2 > 255 * t.outputLen) throw new Error("Length should be <= 255*HashLen");
  let u2 = Math.ceil(n2 / t.outputLen);
  e === void 0 && (e = m2);
  let d3 = new Uint8Array(u2 * t.outputLen), c2 = l.create(t, o3), p = c2._cloneInto(), i2 = new Uint8Array(c2.outputLen);
  for (let r2 = 0; r2 < u2; r2++) s3[0] = r2 + 1, p.update(r2 === 0 ? m2 : i2).update(e).update(s3).digestInto(i2), d3.set(i2, t.outputLen * r2), c2._cloneInto(p);
  return c2.destroy(), p.destroy(), i2.fill(0), s3.fill(0), d3.slice(0, n2);
}
var H = (t, o3, e, n2, u2) => A(t, w2(t, o3, e), n2, u2);

// https://esm.sh/v135/@noble/hashes@1.4.0/denonext/_md.js
function m3(o3, t, s4, i2) {
  if (typeof o3.setBigUint64 == "function") return o3.setBigUint64(t, s4, i2);
  let n2 = BigInt(32), h2 = BigInt(4294967295), e = Number(s4 >> n2 & h2), r2 = Number(s4 & h2), c2 = i2 ? 4 : 0, u2 = i2 ? 0 : 4;
  o3.setUint32(t + c2, e, i2), o3.setUint32(t + u2, r2, i2);
}
var B2 = (o3, t, s4) => o3 & t ^ ~o3 & s4;
var L2 = (o3, t, s4) => o3 & t ^ o3 & s4 ^ t & s4;
var d2 = class extends y {
  constructor(t, s4, i2, n2) {
    super(), this.blockLen = t, this.outputLen = s4, this.padOffset = i2, this.isLE = n2, this.finished = false, this.length = 0, this.pos = 0, this.destroyed = false, this.buffer = new Uint8Array(t), this.view = B(this.buffer);
  }
  update(t) {
    u(this);
    let { view: s4, buffer: i2, blockLen: n2 } = this;
    t = s2(t);
    let h2 = t.length;
    for (let e = 0; e < h2; ) {
      let r2 = Math.min(n2 - this.pos, h2 - e);
      if (r2 === n2) {
        let c2 = B(t);
        for (; n2 <= h2 - e; e += n2) this.process(c2, e);
        continue;
      }
      i2.set(t.subarray(e, e + r2), this.pos), this.pos += r2, e += r2, this.pos === n2 && (this.process(s4, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    u(this), c(t, this), this.finished = true;
    let { buffer: s4, view: i2, blockLen: n2, isLE: h2 } = this, { pos: e } = this;
    s4[e++] = 128, this.buffer.subarray(e).fill(0), this.padOffset > n2 - e && (this.process(i2, 0), e = 0);
    for (let f2 = e; f2 < n2; f2++) s4[f2] = 0;
    m3(i2, n2 - 8, BigInt(this.length * 8), h2), this.process(i2, 0);
    let r2 = B(t), c2 = this.outputLen;
    if (c2 % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
    let u2 = c2 / 4, l2 = this.get();
    if (u2 > l2.length) throw new Error("_sha2: outputLen bigger than state");
    for (let f2 = 0; f2 < u2; f2++) r2.setUint32(4 * f2, l2[f2], h2);
  }
  digest() {
    let { buffer: t, outputLen: s4 } = this;
    this.digestInto(t);
    let i2 = t.slice(0, s4);
    return this.destroy(), i2;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    let { blockLen: s4, buffer: i2, length: n2, finished: h2, destroyed: e, pos: r2 } = this;
    return t.length = n2, t.pos = r2, t.finished = h2, t.destroyed = e, n2 % s4 && t.buffer.set(i2), t;
  }
};

// https://esm.sh/v135/@noble/hashes@1.4.0/denonext/sha256.js
var F = new Uint32Array([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]);
var b = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
var h = new Uint32Array(64);
var A2 = class extends d2 {
  constructor() {
    super(64, 32, 8, false), this.A = b[0] | 0, this.B = b[1] | 0, this.C = b[2] | 0, this.D = b[3] | 0, this.E = b[4] | 0, this.F = b[5] | 0, this.G = b[6] | 0, this.H = b[7] | 0;
  }
  get() {
    let { A: d3, B: o3, C: t, D: c2, E: e, F: f2, G: s4, H: a } = this;
    return [d3, o3, t, c2, e, f2, s4, a];
  }
  set(d3, o3, t, c2, e, f2, s4, a) {
    this.A = d3 | 0, this.B = o3 | 0, this.C = t | 0, this.D = c2 | 0, this.E = e | 0, this.F = f2 | 0, this.G = s4 | 0, this.H = a | 0;
  }
  process(d3, o3) {
    for (let x2 = 0; x2 < 16; x2++, o3 += 4) h[x2] = d3.getUint32(o3, false);
    for (let x2 = 16; x2 < 64; x2++) {
      let u2 = h[x2 - 15], r2 = h[x2 - 2], H2 = E(u2, 7) ^ E(u2, 18) ^ u2 >>> 3, p = E(r2, 17) ^ E(r2, 19) ^ r2 >>> 10;
      h[x2] = p + h[x2 - 7] + H2 + h[x2 - 16] | 0;
    }
    let { A: t, B: c2, C: e, D: f2, E: s4, F: a, G: n2, H: l2 } = this;
    for (let x2 = 0; x2 < 64; x2++) {
      let u2 = E(s4, 6) ^ E(s4, 11) ^ E(s4, 25), r2 = l2 + u2 + B2(s4, a, n2) + F[x2] + h[x2] | 0, p = (E(t, 2) ^ E(t, 13) ^ E(t, 22)) + L2(t, c2, e) | 0;
      l2 = n2, n2 = a, a = s4, s4 = f2 + r2 | 0, f2 = e, e = c2, c2 = t, t = r2 + p | 0;
    }
    t = t + this.A | 0, c2 = c2 + this.B | 0, e = e + this.C | 0, f2 = f2 + this.D | 0, s4 = s4 + this.E | 0, a = a + this.F | 0, n2 = n2 + this.G | 0, l2 = l2 + this.H | 0, this.set(t, c2, e, f2, s4, a, n2, l2);
  }
  roundClean() {
    h.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
  }
};
var C2 = class extends A2 {
  constructor() {
    super(), this.A = -1056596264, this.B = 914150663, this.C = 812702999, this.D = -150054599, this.E = -4191439, this.F = 1750603025, this.G = 1694076839, this.H = -1090891868, this.outputLen = 28;
  }
};
var y2 = C(() => new A2());
var U = C(() => new C2());

// src/bundled/encrypted-root-key/toBundle.ts
function bytesToHexString(bytes) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function generateRandomSeed() {
  const key = await crypto.getRandomValues(new Uint8Array(32));
  const hexString = bytesToHexString(key);
  return hexString;
}
function numToBytes(num, bytes) {
  const b2 = new ArrayBuffer(bytes);
  const v = new DataView(b2);
  v.setUint32(0, num);
  return new Uint8Array(b2);
}
async function generateSeckey(initialKey, keyIndex) {
  const dkLen = 32;
  const salt = numToBytes(keyIndex, dkLen);
  const info = "seckey";
  const seckey = H(y2, V(initialKey), salt, info, dkLen);
  console.log(seckey, "seckey");
  return seckey;
}
var go = async () => {
  const seed = await generateRandomSeed();
  const seedKeys = await Lit.Actions.broadcastAndCollect({
    name: "seedKeys",
    value: seed
  });
  const combineSeedKeys = seedKeys.join("");
  const seckey = await generateSeckey(combineSeedKeys, 0);
  // console.log("seckey", seckey, "combineSeedKeys", combineSeedKeys);
  Lit.Actions.setResponse({ response: combineSeedKeys });
};
go();
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
