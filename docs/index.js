(function(root, factory) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = factory();
    else if ('function' == typeof define && define.amd) define([], factory);
    else if ('object' == typeof exports) exports["isChinaUser"] = factory();
    else root["isChinaUser"] = factory();
})(globalThis, ()=>(()=>{
        "use strict";
        // The require scope
        var __webpack_require__ = {};
        /************************************************************************/ // webpack/runtime/define_property_getters
        (()=>{
            __webpack_require__.d = function(exports1, definition) {
                for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
                    enumerable: true,
                    get: definition[key]
                });
            };
        })();
        // webpack/runtime/has_own_property
        (()=>{
            __webpack_require__.o = function(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop);
            };
        })();
        // webpack/runtime/make_namespace_object
        (()=>{
            // define __esModule on exports
            __webpack_require__.r = function(exports1) {
                if ('undefined' != typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
                    value: 'Module'
                });
                Object.defineProperty(exports1, '__esModule', {
                    value: true
                });
            };
        })();
        /************************************************************************/ var __webpack_exports__ = {};
        // ESM COMPAT FLAG
        __webpack_require__.r(__webpack_exports__);
        // EXPORTS
        __webpack_require__.d(__webpack_exports__, {
            isChinaByEmoji: ()=>/* reexport */ isChinaByEmoji,
            isChinaUser: ()=>/* binding */ isChinaUser,
            isChinaByFont: ()=>/* reexport */ isChinaByFont,
            DEFAULT_CHINESE_FONTS: ()=>/* reexport */ DEFAULT_CHINESE_FONTS,
            isChinaByLanguage: ()=>/* reexport */ isChinaByLanguage,
            isChinaByTimeZone: ()=>/* reexport */ isChinaByTimeZone
        });
        /** 通过 Emoji 判断当前设备是否是中国大陆用户
 *  如果 🇹🇼 字符无法显示，说明是中国大陆用户
 *
 * 如果是 Windows 环境，不能通过此方法判断，因为 Windows 所有国旗 Emoji 都不支持显示 */ function isChinaByEmoji() {
            if (isWindows()) return null;
            let detectChar = "🇹🇼";
            let result = getCharColors(detectChar);
            return result.isMono;
        }
        function getCharColors(char) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const fontSize = 100;
            if (!ctx) throw new Error("Canvas context not supported");
            canvas.width = fontSize;
            canvas.height = fontSize;
            // 使用系统字体渲染
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "black";
            ctx.textBaseline = "top";
            // 渲染字符到画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillText(char, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const colorSet = new Set();
            let isMono = true;
            for(let i = 0; i < imageData.data.length; i += 4){
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const a = imageData.data[i + 3];
                if (a > 0) {
                    const color = `${r},${g},${b}`;
                    colorSet.add(color);
                    // 判断颜色是否为黑白（即 R、G、B 值相同）
                    if (isMono && !(r === g && g === b)) isMono = false;
                }
            }
            // 转换 Set 为二维颜色数组
            const colors = Array.from(colorSet).map((color)=>color.split(",").map(Number));
            canvas.remove();
            return {
                colors,
                isMono
            };
        }
        /** 判断是否为 Windows 系统 */ function isWindows() {
            return navigator.platform.startsWith("Win");
        }
        /**
 * 通过浏览器可用中文字体判断是否更像中文用户环境
 */ const DEFAULT_CHINESE_FONTS = [
            "DengXian",
            "FangSong",
            "方正小标宋简体",
            "小标宋体",
            "仿宋_GB2312",
            "HarmonyOS Sans",
            "Alibaba PuHuiTi",
            "Microsoft YaHei",
            "Smiley Sans"
        ];
        function isChinaByFont(options) {
            if ("undefined" == typeof document) return false;
            const chineseFonts = (null == options ? void 0 : options.fontList) ?? DEFAULT_CHINESE_FONTS;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return false;
            const result = chineseFonts.some((font)=>isFontAvailable(ctx, font));
            canvas.remove();
            return result;
        }
        function isFontAvailable(ctx, font) {
            const baseFonts = [
                "monospace",
                "sans-serif",
                "serif"
            ];
            const sample = "mmmmmmmmmmlli中文测试";
            return baseFonts.some((baseFont)=>{
                ctx.font = `72px ${baseFont}`;
                const baseWidth = ctx.measureText(sample).width;
                ctx.font = `72px "${font}", ${baseFont}`;
                const fontWidth = ctx.measureText(sample).width;
                return fontWidth !== baseWidth;
            });
        }
        /**
 * 通过语言设置判断是否是中国用户
 */ function isChinaByLanguage(options) {
            const navigatorLanguage = navigator.language || navigator.userLanguage || "en";
            const languages = navigator.languages || [
                navigatorLanguage
            ];
            const isChinese = (lang)=>{
                if (null == options ? void 0 : options.mainland) return /^zh(-CN|-Hans)?$/i.test(lang);
                return /^zh/i.test(lang);
            };
            if (null == options ? void 0 : options.strict) return isChinese(languages[0]);
            return languages.some(isChinese);
        }
        /**
 * 通过时区判断是否是中国用户
 */ function isChinaByTimeZone(options) {
            const { mainland = false } = options ?? {};
            if ("object" == typeof Intl && "function" == typeof Intl.DateTimeFormat) {
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (timeZone) {
                    const mainlandTimeZones = [
                        "Asia/Shanghai",
                        "Asia/Chongqing",
                        "Asia/Harbin",
                        "Asia/Urumqi",
                        "Asia/Beijing"
                    ];
                    const greaterChinaTimeZones = [
                        ...mainlandTimeZones,
                        "Asia/Hong_Kong",
                        "Asia/Macau",
                        "Asia/Taipei"
                    ];
                    // 根据 options 决定使用哪个时区集合
                    const targetZones = new Set(mainland ? mainlandTimeZones : greaterChinaTimeZones);
                    return targetZones.has(timeZone);
                }
            }
            // 如果没有 Intl 或无法获取时区，使用 UTC 偏移量判断
            const offset = new Date().getTimezoneOffset();
            // 中国标准时间 UTC+8，对应的分钟偏移量为 -480
            return -480 === offset;
        }
        /** 判断当前用户是中国用户
 *  - 语言（语言列表任一项出现中文）
 *  - 时区
 *  - 设备特征
 *  三者**任意满足其一**即判断为中国用户
 *
 * 如果是 Windows 系统不判断设备特征
 *
 * 默认情况中国大陆、台湾、香港、澳门都视作中国用户
 * 如果要判断
 */ function isChinaUser(options) {
            return isChinaByLanguage() || isChinaByTimeZone() || isChinaByEmoji() || isChinaByFont();
        }
        return __webpack_exports__;
    })());
