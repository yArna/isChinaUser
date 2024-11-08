# isChinaUser 🇨🇳

检查当前设备是否是中国地区的设备

## 为什么？

如果你需要在浏览器端识别中国用户或非中国用户以实现不同的逻辑，那么这个库就是为你准备的。


单纯用语言信息来判断是目前主流的方法，但这不准确，有些中国用户会使用英文系统，有些非中国用户会使用中文系统。
如果你需要更严格的判断就需要这个库了。


一个使用场景是只对中国用户显示一些内容，而屏蔽海外用户，同时尽可能的让海外的中国用户看到内容（他们可能用着当地语言的系统、时区，这通常很难判断，但我们可以判断它的设备是否是国行的）。

这个库有三个判断来源：

- 语言信息，包括当前首选语言和备选语言(`navigator.language` 和 `navigator.languages`)。
- 时区信息，中国用户的时区一般是 `Asia/Shanghai` 或者 UTC 偏移为 `+8` 的时区。
- 设备特征，中国大陆地区的设备有一些字符是没有的如旗帜（`🇹🇼`），通常这很难伪装。（Windows 无论是否是中国设备都不会国旗，所以 Windows 系统无法判断）

## 使用

```node
npm i is-china-user
```

```js
import { isChinaDevice, isChinaUser } from "is-china-user";

console.log(isChinaDevice()); // true or false
console.log(isChinaUser()); // true or false
```

### 方法

#### `isChinaUser()`

判断当前用户是中国用户

- 语言（语言列表任一项出现中文）
- 时区
- 设备特征

三者**任意满足其一**即判断为中国用户

中国大陆、台湾、香港、澳门视作中国用户

#### `isChinaUserStrict()`

严格条件下判断当前用户是中国用户

- 语言（首选语言是中文）
- 时区
- 设备特征

三者**全都满足**才判断为中国用户

如果是 Windows 系统不判断设备特征

中国大陆、台湾、香港、澳门视作中国用户

#### `isChinaUserStrictSimplified()`

严格条件下判断当前用户是中国大陆简体中文用户

如果是 Windows 系统不判断设备特征

- 语言（首选语言是简体中文）
- 时区
- 设备特征

---

#### `isChinaDevice()`

检查当前设备是否是中国的设备

#### `isChinaLanguage()`

检查用户的语言设置是否为中文。

#### `isChinaTimeZone()`

验证当前时间区域是否为中国标准时间。
