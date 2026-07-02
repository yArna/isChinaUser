# 🇨🇳 isChinaUser

判断当前浏览器环境是否更像中国用户 / 中国地区设备。

这个库不依赖单一信号，而是组合了三类浏览器特征：

- 语言信息：`navigator.language` 与 `navigator.languages`
- 时区信息：`Intl.DateTimeFormat().resolvedOptions().timeZone`
- 设备特征：通过 Emoji 渲染差异做一个轻量探测
- 字体信息：检测浏览器可用的常见中文字体

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
4. 使用纯英文操作系统，避免系统字体库有中文字体
5. 避免无法显示某些特殊 Emoji，这个最麻烦因为很多情况下跟随设备无法更改，需要修改相关操作系统配置文件。

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

- 返回 `true` 表示更像中国大陆设备
- 返回 `false` 表示未命中
- 在 Windows 上返回 `null`，因为国旗 Emoji 的渲染差异不适合作为可靠信号

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
  fontList: ["Microsoft YaHei", "PingFang SC", "HarmonyOS Sans"],
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
  fontList: ["Microsoft YaHei", "PingFang SC"],
});

console.log({ isCNLang, isCST, isEmojiMatch, isFontMatch });
```

## 说明

- 这个库是浏览器侧判断，不建议在 Node.js 里直接调用 `isChinaByEmoji()`
- `isChinaUser()` 偏向“尽量识别”，不是法律意义或身份意义上的严格归类
- 如果要仅识别中国大陆用户，需要使用 `{ mainland: true }` 参数

## 示例站点

[https://yarna.github.io/isChinaUser/](https://yarna.github.io/isChinaUser/)
