# 🇨🇳 isChinaUser

判断当前浏览器环境是否更像中国用户 / 中国地区设备。

这个库不依赖单一信号，而是组合了五类浏览器特征：

- 语言信息：`navigator.language` 与 `navigator.languages`
- 时区信息：`Intl.DateTimeFormat().resolvedOptions().timeZone`
- 设备特征：通过 Emoji 渲染差异做一个轻量探测
- 字体信息：检测浏览器可用的常见中文字体
- 网络特征：通过 GFW 可达性探测判断当前网络出口（异步，可选）

## 安装

```bash
npm i is-china-user
```

## 使用

```ts
import { isChinaUser } from "is-china-user";

// 中国用户
isChinaUser(); // true
// 中国大陆用户
isChinaUser({ mainland: true }); // true
```

## 如何避免被判断为中国用户

1. 修改浏览器语言，避免含有中文
2. 修改操作系统语言，避免含有中文
3. 修改操作系统时区，选中国相邻的国家和地区（如果选西方有可能根据访问时间和时区内平均时间不一致反而被标记）
4. 使用纯英文操作系统，避免系统字体库有特定中文字体，如仿宋、等线等
5. 避免无法显示某些特殊 Emoji，这个最麻烦因为很多情况下跟随设备无法更改，需要修改相关操作系统配置文件。
6. **最重要**：网络出口（IP 地理位置）。服务端能直接看到你的 IP、账号注册信息、支付方式所属地区，这些信号的权重通常远高于浏览器侧特征。本库的 `isChinaByNetwork()` 可以粗略自查当前网络出口是否在 GFW 内。

## API

### `isChinaByLanguage(options?)`

判断当前语言设置是否为中文。

默认规则：

- `navigator.languages` 中只要任意一项是中文，就返回 `true`

可选参数：

```ts
isChinaByLanguage({
  mainland?: boolean;
  strict?: boolean;
});
```

- `mainland: true` 时，只接受更偏向中国大陆简体环境的语言写法，例如 `zh-CN`、`zh-Hans`
- `strict: true` 时，只检查首选语言 `navigator.languages[0]`

示例：

```ts
isChinaByLanguage(); // 宽松判断
isChinaByLanguage({ strict: true }); // 只看首选语言
isChinaByLanguage({ mainland: true }); // 只认大陆简体倾向
```

### `isChinaByTimeZone(options?)`

判断时区是否在中国相关时区内。

可选参数：

```ts
isChinaByTimeZone({
  mainland?: boolean;
  strict?: boolean;
});
```

- 默认会把大陆和港澳台常见时区都视作正向信号
- `mainland: true` 时，只认大陆常见时区
- 如果无法读取 `Intl` 时区，会退回到 `getTimezoneOffset()`，以 `UTC+8` 作为备选判断
- `strict:true` 时不会退回 `UTC+8` 而必须是已知时区

### `isChinaByEmoji()`

通过 Emoji 渲染差异判断设备特征。

内部会先用 😀 做对照：只有设备能正常彩色渲染普通 Emoji、却无法彩色渲染 🇹🇼 时才判定命中，避免在缺少彩色 Emoji 字体的环境（如部分 Linux）或开启 canvas 指纹保护的浏览器上误报。

- 返回 `true` 表示更像中国大陆设备
- 返回 `false` 表示未命中
- 返回 `null` 表示无法判断（Windows、无 DOM 环境、设备不支持彩色 Emoji 渲染等）

### `isChinaByNetwork(options?)`

**异步**方法，通过网络可达性判断当前网络出口是否在中国大陆（GFW 探测）。

原理：同时请求一个大陆被屏蔽的资源（探针）和一个大陆可达的资源（对照）：

- 探针可达 → 返回 `false`（不在大陆网络，或已走代理）
- 探针不可达但对照可达 → 返回 `true`（典型 GFW 特征）
- 两者都不可达 → 返回 `null`（可能离线或被扩展拦截，无法判断）

```ts
const result = await isChinaByNetwork({ timeout: 3000 });
```

与其它几个设备侧信号不同，这个方法反映的是**当前网络出口**，更接近服务端实际看到的用户位置——如果你想知道某个网站/API 会不会把你当成中国用户，这是权重最高的信号。

注意：会产生真实网络请求，且结果受代理/VPN 影响（这正是它的用途）。默认的 `isChinaUser()` 是同步方法，不包含此检测，需要单独调用。

### `isChinaByFont(options?)`

检测浏览器是否能使用常见中文字体，例如 `DengXian`、`FangSong` 等。

可选参数：

```ts
isChinaByFont({
  fontList?: string[];
});
```

- `fontList` 用来覆盖默认字体列表
- 适合你想针对特定字体集合做检测，或者在自己的业务里做更细的环境探测

- 返回 `true` 表示检测到常见中文字体
- 返回 `false` 表示未命中，或当前环境不支持 canvas 检测

示例：

```ts
isChinaByFont();
isChinaByFont({
  fontList: ["HarmonyOS Sans"],
});
```

### `isChinaUser()`

综合判断当前用户是否更像中国用户。

它会把语言、时区、Emoji 设备特征、中文字体四类信号做组合判断，只要任意一个信号为正，就返回 `true`。

## 推荐用法

如果你只想快速分流：

```ts
if (isChinaUser()) {
  // show China-specific content
}
```

如果你想更可控：

```ts
const isCNLang = isChinaByLanguage({ strict: true });
const isCST = isChinaByTimeZone();
const isEmojiMatch = isChinaByEmoji();
const isFontMatch = isChinaByFont({
  fontList: ["方正黑体"],
});

console.log({ isCNLang, isCST, isEmojiMatch, isFontMatch });
```

## 说明

- 这个库是浏览器侧判断，不建议在 Node.js 里直接调用 `isChinaByEmoji()`
- `isChinaUser()` 偏向“尽量识别”，不是法律意义或身份意义上的严格归类
- 如果要仅识别中国大陆用户，需要使用 `{ mainland: true }` 参数

## 示例站点

[https://yarna.github.io/isChinaUser/](https://yarna.github.io/isChinaUser/)
