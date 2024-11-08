import { isChinaDevice } from "./isChinaDevice";
import { isChinaLanguage } from "./isChinaLanguage";
import { isChinaTimeZone } from "./isChinaTimeZone";

export { isChinaDevice, isChinaLanguage, isChinaTimeZone };

/** 判断当前用户是中国用户
 *  - 语言（语言列表任一项出现中文）
 *  - 时区
 *  - 设备特征
 *  三者**任意满足其一**即判断为中国用户
 *
 *  中国大陆、台湾、香港、澳门视作中国用户
 */
export function isChinaUser() {
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
 */
export function isChinaUserStrict() {
  if (isWindows()) {
    return isChinaLanguage({ strict: true }) && isChinaTimeZone();
  }
  return (
    isChinaLanguage({ strict: true }) && isChinaTimeZone() && isChinaDevice()
  );
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
 */
export function isChinaUserStrictSimplified() {
  if (isWindows()) {
    return (
      isChinaLanguage({ strict: true, onlySimplified: true }) &&
      isChinaTimeZone()
    );
  }
  return (
    isChinaLanguage({ strict: true, onlySimplified: true }) &&
    isChinaTimeZone() &&
    isChinaDevice()
  );
}

/** 判断是否为 Windows 系统 */
function isWindows(): boolean {
  return navigator.platform.startsWith("Win");
}
