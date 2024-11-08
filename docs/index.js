function isChinaDevice(options) {
    let detectChar = (null == options ? void 0 : options.detectChar) ?? "🇹🇼";
    let result = getCharColors(detectChar);
    //   console.log("isChinaDevice result:", result);
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
/** @param [options.strict] - 首选语言是中文才判断是中文语言
 *  @param [options.simplified] - 仅判断简体中文
 */ function isChinaLanguage(options) {
    const navigatorLanguage = navigator.language || navigator.userLanguage || "en";
    const languages = navigator.languages || [
        navigatorLanguage
    ];
    const isChinese = (lang)=>{
        if (null == options ? void 0 : options.onlySimplified) return /^zh(-CN|-Hans)?$/i.test(lang);
        return /^zh/i.test(lang);
    };
    if (null == options ? void 0 : options.strict) return isChinese(languages[0]);
    return languages.some(isChinese);
}
function isChinaTimeZone() {
    if ('object' == typeof Intl && 'function' == typeof Intl.DateTimeFormat) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone) {
            const chinaTimeZones = [
                "Asia/Shanghai",
                "Asia/Chongqing",
                "Asia/Harbin",
                "Asia/Urumqi",
                "Asia/Hong_Kong",
                "Asia/Macau",
                "Asia/Taipei",
                "Asia/Beijing"
            ];
            return chinaTimeZones.includes(timeZone);
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
 *  中国大陆、台湾、香港、澳门视作中国用户
 */ function isChinaUser() {
    return isChinaLanguage() || isChinaTimeZone() || isChinaDevice();
}
/** 严格条件下判断当前用户是中国用户
 *  - 语言（首选语言是中文）
 *  - 时区
 *  - 设备特征
 * 三者**全都满足**才判断为中国用户
 *
 * 如果是 Windows 系统不判断设备特征
 *
 * 中国大陆、台湾、香港、澳门都视作中国用户
 */ function isChinaUserStrict() {
    if (isWindows()) return isChinaLanguage({
        strict: true
    }) && isChinaTimeZone();
    return isChinaLanguage({
        strict: true
    }) && isChinaTimeZone() && isChinaDevice();
}
/** 严格条件下判断当前用户是中国大陆简体中文用户
 *  - 语言（首选语言是简体中文）
 *  - 时区
 *  - 设备特征
 *
 *  如果是 Windows 系统不判断设备特征
 *
 *  严格判断简中用户
 * @returns
 */ function isChinaUserStrictSimplified() {
    if (isWindows()) return isChinaLanguage({
        strict: true,
        onlySimplified: true
    }) && isChinaTimeZone();
    return isChinaLanguage({
        strict: true,
        onlySimplified: true
    }) && isChinaTimeZone() && isChinaDevice();
}
/** 判断是否为 Windows 系统 */ function isWindows() {
    return navigator.platform.startsWith("Win");
}
export { isChinaDevice, isChinaLanguage, isChinaTimeZone, isChinaUser, isChinaUserStrict, isChinaUserStrictSimplified };
