import test from "node:test";
import assert from "node:assert/strict";

import {
  isChinaByEmoji,
  isChinaByFont,
  isChinaByLanguage,
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

function createCanvasStub(pixels) {
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
          return { data: pixels };
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

  withPatchedGlobals(
    {
      navigator: {
        language: "en-US",
        languages: ["en-US"],
        platform: "MacIntel",
      },
      document: {
        createElement() {
          return createCanvasStub([
            0, 0, 0, 255,
            0, 0, 0, 255,
          ]);
        },
      },
    },
    () => {
      assert.equal(isChinaByEmoji(), true);
    },
  );

  withPatchedGlobals(
    {
      navigator: {
        language: "en-US",
        languages: ["en-US"],
        platform: "MacIntel",
      },
      document: {
        createElement() {
          return createCanvasStub([
            255, 0, 0, 255,
            0, 255, 0, 255,
          ]);
        },
      },
    },
    () => {
      assert.equal(isChinaByEmoji(), false);
    },
  );
});

test("isChinaByFont detects available chinese fonts with canvas metrics", () => {
  withPatchedGlobals(
    {
      document: {
        createElement() {
          return createEmojiAndFontCanvasStub("Microsoft YaHei");
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
          return createEmojiAndFontCanvasStub("Microsoft YaHei");
        },
      },
    },
    () => {
      assert.equal(isChinaUser(), true);
    },
  );
});
