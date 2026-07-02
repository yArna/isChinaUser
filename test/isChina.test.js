import test from "node:test";
import assert from "node:assert/strict";

import {
  isChinaByEmoji,
  isChinaByFont,
  isChinaByLanguage,
  isChinaByNetwork,
  isChinaByTimeZone,
  isChinaUser,
} from "../dist/index.js";

function withPatchedGlobals(patches, fn) {
  const restores = [];

  for (const [key, value] of Object.entries(patches)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    restores.push(() => {
      if (original) {
        Object.defineProperty(globalThis, key, original);
      } else {
        delete globalThis[key];
      }
    });

    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }

  try {
    return fn();
  } finally {
    while (restores.length > 0) {
      restores.pop()();
    }
  }
}

const COLOR_PIXELS = [255, 0, 0, 255, 0, 255, 0, 255];
const MONO_PIXELS = [0, 0, 0, 255, 0, 0, 0, 255];
const EMPTY_PIXELS = [];

function createCanvasStub(pixelsByChar) {
  let lastChar = "";
  return {
    width: 0,
    height: 0,
    getContext() {
      return {
        font: "",
        fillStyle: "",
        textBaseline: "",
        clearRect() {},
        fillText(char) {
          lastChar = char;
        },
        getImageData() {
          return { data: pixelsByChar[lastChar] ?? EMPTY_PIXELS };
        },
      };
    },
    remove() {},
  };
}

function createFontCanvasStub(availableFont) {
  return {
    width: 0,
    height: 0,
    getContext() {
      return {
        font: "",
        measureText() {
          const isRequestedFont =
            availableFont !== "Unavailable Font" &&
            this.font.includes(`"${availableFont}"`);

          return {
            width: isRequestedFont ? 120 : 100,
          };
        },
      };
    },
    remove() {},
  };
}

function createEmojiAndFontCanvasStub(availableFont) {
  return {
    width: 0,
    height: 0,
    getContext() {
      return {
        font: "",
        fillStyle: "",
        textBaseline: "",
        clearRect() {},
        fillText() {},
        getImageData() {
          return {
            data: [
              255, 0, 0, 255,
              0, 255, 0, 255,
            ],
          };
        },
        measureText() {
          const isRequestedFont =
            availableFont !== "Unavailable Font" &&
            this.font.includes(`"${availableFont}"`);

          return {
            width: isRequestedFont ? 120 : 100,
          };
        },
      };
    },
    remove() {},
  };
}

test("isChinaByLanguage detects chinese from any preferred language by default", () => {
  withPatchedGlobals(
    {
      navigator: {
        language: "en-US",
        languages: ["en-US", "zh-Hant"],
        platform: "MacIntel",
      },
    },
    () => {
      assert.equal(isChinaByLanguage(), true);
    },
  );
});

test("isChinaByLanguage respects strict and mainland options", () => {
  withPatchedGlobals(
    {
      navigator: {
        language: "zh-Hant",
        languages: ["zh-Hant", "en-US"],
        platform: "MacIntel",
      },
    },
    () => {
      assert.equal(isChinaByLanguage({ strict: true }), true);
      assert.equal(isChinaByLanguage({ mainland: true }), false);
      assert.equal(isChinaByLanguage({ mainland: true, strict: true }), false);
    },
  );

  withPatchedGlobals(
    {
      navigator: {
        language: "zh-Hans",
        languages: ["zh-Hans", "en-US"],
        platform: "MacIntel",
      },
    },
    () => {
      assert.equal(isChinaByLanguage({ mainland: true, strict: true }), true);
    },
  );
});

test("isChinaByTimeZone detects china time zones and UTC+8 fallback", () => {
  withPatchedGlobals(
    {
      Intl: {
        DateTimeFormat() {
          return {
            resolvedOptions() {
              return { timeZone: "Asia/Taipei" };
            },
          };
        },
      },
    },
    () => {
      assert.equal(isChinaByTimeZone(), true);
      assert.equal(isChinaByTimeZone({ mainland: true }), false);
    },
  );

  const original = Date.prototype.getTimezoneOffset;
  Date.prototype.getTimezoneOffset = () => -480;

  try {
    withPatchedGlobals({ Intl: undefined }, () => {
      assert.equal(isChinaByTimeZone(), true);
    });
  } finally {
    Date.prototype.getTimezoneOffset = original;
  }
});

test("isChinaByEmoji returns null on windows and inspects canvas elsewhere", () => {
  withPatchedGlobals(
    {
      navigator: {
        language: "en-US",
        languages: ["en-US"],
        platform: "Win32",
      },
    },
    () => {
      assert.equal(isChinaByEmoji(), null);
    },
  );

  const macNavigator = {
    language: "en-US",
    languages: ["en-US"],
    platform: "MacIntel",
  };

  // 对照 Emoji 彩色正常，旗帜渲染为黑白字母 → 大陆设备特征
  withPatchedGlobals(
    {
      navigator: macNavigator,
      document: {
        createElement() {
          return createCanvasStub({ "😀": COLOR_PIXELS, "🇹🇼": MONO_PIXELS });
        },
      },
    },
    () => {
      assert.equal(isChinaByEmoji(), true);
    },
  );

  // 对照 Emoji 彩色正常，旗帜完全不渲染 → 大陆设备特征
  withPatchedGlobals(
    {
      navigator: macNavigator,
      document: {
        createElement() {
          return createCanvasStub({ "😀": COLOR_PIXELS, "🇹🇼": EMPTY_PIXELS });
        },
      },
    },
    () => {
      assert.equal(isChinaByEmoji(), true);
    },
  );

  // 旗帜彩色渲染 → 非大陆设备
  withPatchedGlobals(
    {
      navigator: macNavigator,
      document: {
        createElement() {
          return createCanvasStub({ "😀": COLOR_PIXELS, "🇹🇼": COLOR_PIXELS });
        },
      },
    },
    () => {
      assert.equal(isChinaByEmoji(), false);
    },
  );

  // 设备连普通 Emoji 都无法彩色渲染 → 无法判断，返回 null 而不是误报 true
  withPatchedGlobals(
    {
      navigator: macNavigator,
      document: {
        createElement() {
          return createCanvasStub({ "😀": MONO_PIXELS, "🇹🇼": MONO_PIXELS });
        },
      },
    },
    () => {
      assert.equal(isChinaByEmoji(), null);
    },
  );

  // 画布完全空白（如指纹保护环境）→ 无法判断
  withPatchedGlobals(
    {
      navigator: macNavigator,
      document: {
        createElement() {
          return createCanvasStub({});
        },
      },
    },
    () => {
      assert.equal(isChinaByEmoji(), null);
    },
  );
});

test("isChinaByLanguage accepts full BCP 47 mainland tags like zh-Hans-CN", () => {
  withPatchedGlobals(
    {
      navigator: {
        language: "zh-Hans-CN",
        languages: ["zh-Hans-CN", "en-US"],
        platform: "MacIntel",
      },
    },
    () => {
      assert.equal(isChinaByLanguage({ mainland: true }), true);
      assert.equal(isChinaByLanguage({ mainland: true, strict: true }), true);
    },
  );
});

test("isChinaByTimeZone recognizes legacy tzdata aliases", () => {
  const withTimeZone = (timeZone, fn) => {
    withPatchedGlobals(
      {
        Intl: {
          DateTimeFormat() {
            return {
              resolvedOptions() {
                return { timeZone };
              },
            };
          },
        },
      },
      fn,
    );
  };

  withTimeZone("PRC", () => {
    assert.equal(isChinaByTimeZone(), true);
    assert.equal(isChinaByTimeZone({ mainland: true }), true);
  });

  withTimeZone("Hongkong", () => {
    assert.equal(isChinaByTimeZone(), true);
    assert.equal(isChinaByTimeZone({ mainland: true }), false);
  });

  withTimeZone("ROC", () => {
    assert.equal(isChinaByTimeZone(), true);
    assert.equal(isChinaByTimeZone({ mainland: true }), false);
  });
});

test("isChinaByNetwork distinguishes GFW pattern from offline and open networks", async () => {
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const makeFetch = ({ blockedSiteReachable, controlSiteReachable }) => {
    return (url) => {
      const reachable = url.includes("gstatic")
        ? blockedSiteReachable
        : controlSiteReachable;
      return reachable
        ? Promise.resolve({ ok: true })
        : Promise.reject(new Error("network error"));
    };
  };

  try {
    // 探针可达 → 非大陆网络
    globalThis.fetch = makeFetch({
      blockedSiteReachable: true,
      controlSiteReachable: true,
    });
    assert.equal(await isChinaByNetwork(), false);

    // 探针被墙、对照可达 → 典型 GFW 特征
    globalThis.fetch = makeFetch({
      blockedSiteReachable: false,
      controlSiteReachable: true,
    });
    assert.equal(await isChinaByNetwork(), true);

    // 全部不可达 → 可能离线，无法判断
    globalThis.fetch = makeFetch({
      blockedSiteReachable: false,
      controlSiteReachable: false,
    });
    assert.equal(await isChinaByNetwork(), null);
  } finally {
    if (originalFetch) {
      Object.defineProperty(globalThis, "fetch", originalFetch);
    } else {
      delete globalThis.fetch;
    }
  }
});

test("isChinaByFont detects available chinese fonts with canvas metrics", () => {
  withPatchedGlobals(
    {
      document: {
        createElement() {
          return createEmojiAndFontCanvasStub("DengXian");
        },
      },
    },
    () => {
      assert.equal(isChinaByFont(), true);
    },
  );

  withPatchedGlobals(
    {
      document: {
        createElement() {
          return createFontCanvasStub("Unavailable Font");
        },
      },
    },
    () => {
      assert.equal(isChinaByFont(), false);
    },
  );
});

test("isChinaByFont accepts a custom fontList option", () => {
  withPatchedGlobals(
    {
      document: {
        createElement() {
          return createFontCanvasStub("Custom Demo Font");
        },
      },
    },
    () => {
      assert.equal(
        isChinaByFont({ fontList: ["Custom Demo Font", "Another Font"] }),
        true,
      );
      assert.equal(
        isChinaByFont({ fontList: ["Missing Font A", "Missing Font B"] }),
        false,
      );
    },
  );
});

test("isChinaUser combines language time zone emoji and font signals", () => {
  withPatchedGlobals(
    {
      navigator: {
        language: "zh-Hans",
        languages: ["zh-Hans"],
        platform: "MacIntel",
      },
      Intl: {
        DateTimeFormat() {
          return {
            resolvedOptions() {
              return { timeZone: "Europe/London" };
            },
          };
        },
      },
      document: {
        createElement() {
          return createEmojiAndFontCanvasStub("Unavailable Font");
        },
      },
    },
    () => {
      assert.equal(isChinaUser(), true);
    },
  );

  withPatchedGlobals(
    {
      navigator: {
        language: "en-US",
        languages: ["en-US"],
        platform: "Win32",
      },
      Intl: {
        DateTimeFormat() {
          return {
            resolvedOptions() {
              return { timeZone: "Europe/London" };
            },
          };
        },
      },
      document: {
        createElement() {
          return createFontCanvasStub("Unavailable Font");
        },
      },
    },
    () => {
      assert.equal(isChinaUser(), false);
    },
  );

  withPatchedGlobals(
    {
      navigator: {
        language: "en-US",
        languages: ["en-US"],
        platform: "MacIntel",
      },
      Intl: {
        DateTimeFormat() {
          return {
            resolvedOptions() {
              return { timeZone: "Europe/London" };
            },
          };
        },
      },
      document: {
        createElement() {
          return createEmojiAndFontCanvasStub("DengXian");
        },
      },
    },
    () => {
      assert.equal(isChinaUser(), true);
    },
  );
});

test("isChinaUser forwards mainland and strict options to language and time zone checks", () => {
  withPatchedGlobals(
    {
      navigator: {
        language: "en-US",
        languages: ["en-US", "zh-Hant"],
        platform: "MacIntel",
      },
      Intl: {
        DateTimeFormat() {
          return {
            resolvedOptions() {
              return { timeZone: "Asia/Taipei" };
            },
          };
        },
      },
      document: {
        createElement() {
          return createEmojiAndFontCanvasStub("Unavailable Font");
        },
      },
    },
    () => {
      assert.equal(isChinaUser(), true);
      assert.equal(isChinaUser({ mainland: true }), false);
      assert.equal(isChinaUser({ strict: true }), true);
    },
  );

  withPatchedGlobals(
    {
      navigator: {
        language: "en-US",
        languages: ["en-US", "zh-Hant"],
        platform: "MacIntel",
      },
      Intl: {
        DateTimeFormat() {
          return {
            resolvedOptions() {
              return { timeZone: "Europe/London" };
            },
          };
        },
      },
      document: {
        createElement() {
          return createEmojiAndFontCanvasStub("Unavailable Font");
        },
      },
    },
    () => {
      assert.equal(isChinaUser(), true);
      assert.equal(isChinaUser({ strict: true }), false);
    },
  );
});
