# Subdock

移动端优先的个人订阅管理网页。当前仅在本地开发，未发布或部署。

## 本地运行

需要 Node.js 22.13+。

```sh
npm install
npm run dev
```

打开开发服务器输出的本地地址，默认 http://localhost:3000。

## 功能

- 添加、编辑、删除、暂停和恢复订阅记录
- 分类与状态筛选、搜索、排序、卡片与列表视图
- 月均及年度开销、未来 7 天续费、可翻月的续费日历、分类支出占比
- 支持 CNY、USD、EUR、GBP、JPY、KRW、HKD、TWD、SGD，并按本位币汇总
- 移动端悬浮玻璃导航、桌面端卡片网格、键盘操作与减少动态效果支持

首次打开提供六条可编辑示例，价格仅用于演示。暂停或删除记录不会取消服务商的实际订阅，应用不发起支付，也不发送系统通知。当前版本以 `localStorage` 作为数据适配层，后续接入账户与云端同步时可替换这一实现。

每条订阅保留原始金额与货币；总览、日历合计和支出洞察使用 Frankfurter 日汇率换算为用户选择的本位币。汇率在 `localStorage` 中缓存 24 小时，请求失败时沿用最后一次成功结果。年付按 12 个月折算；续费使用原始日期的日数，短月份取月末，并在后续月份恢复原始日数。

## 检查

```sh
npm test
npm run typecheck
npm run build
```

包含金额换算、月末和闰年续费、数据校验及国际化资源完整性检查。未执行浏览器自动化视觉或交互测试。

## 技术栈

React 19、TypeScript、Vite、Tailwind CSS、Base UI/Shadcn、Lucide。当前产品是单路由的交互应用，因此使用轻量的 Vite 静态构建，不引入暂时用不到的 SSR 或服务端运行时。

## GitHub 与 Vercel

将仓库推送到 GitHub 后，在 Vercel 中导入该仓库即可。Vercel 会自动识别 Vite；构建命令为 `npm run build`，输出目录为 `dist`，项目当前没有必需的环境变量。网站目前仍只在本地开发，尚未部署。

## 配色与国际化

界面使用固定的暖白墨绿配色，不提供主题切换。右上角可切换语言：简体中文、繁體中文、English、日本語、한국어。

- 初始 HTML 语言与未匹配时的回退语言为简体中文。
- 客户端优先读取手动语言偏好，否则按 `navigator.languages` 的优先级匹配（通常来自浏览器或系统语言设置）。
- `zh-Hant`、台湾、香港、澳门匹配繁体；`zh-Hans`、大陆、新加坡及普通 `zh` 匹配简体，脚本标记优先于地区。
- 首次访问会自动匹配浏览器语言；用户手动切换后会记住该选择。语言偏好与订阅数据分别存储。
- 日期、星期、年月及金额使用 `Intl`；界面语言不会隐式改变订阅货币或统计本位币。
- 五种语言资源位于 `lib/i18n/*.json`，键与插值参数通过测试保持一致。
- 分类沿用已有记录的稳定键，用户输入的服务名称、套餐和备注保持原样；示例套餐仅在显示时翻译。

## 服务图标

添加订阅时可识别 39 个服务。影音、效率与云存储包括 Spotify、Notion、Apple iCloud+、Netflix、Vercel、哔哩哔哩、网易云音乐、腾讯视频、爱奇艺、优酷、QQ 音乐、百度网盘、阿里云盘、WPS Office 和微信读书。AI 服务包括 ChatGPT、Claude、Gemini、Grok、Microsoft Copilot、GitHub Copilot、Perplexity、Cursor、Midjourney、DeepSeek、Kimi、通义千问、豆包、文心一言、腾讯元宝、智谱清言、MiniMax、海螺 AI、Suno、可灵、即梦、讯飞星火、Mistral 和 Manus。名称匹配忽略大小写、首尾空格及连续空格，并接受常见的中文会员名称和英文名称；不对“视频会员”“文心一格”“通义万相”等相邻或模糊名称做猜测。

所有服务都使用相同尺寸的圆角底板，内部只放独立标志，不铺满应用商店图。Spotify、Notion、iCloud、Netflix、Vercel、哔哩哔哩、网易云音乐、微信读书，以及 Claude、Gemini、Perplexity、Cursor、DeepSeek、Kimi、通义千问、GitHub Copilot、Suno、MiniMax、Mistral 使用 [Simple Icons](https://github.com/simple-icons/simple-icons) 的矢量标志。腾讯视频、优酷、QQ 音乐、百度网盘和 WPS Office 使用官网提供的独立 favicon。ChatGPT、Grok、Microsoft Copilot、Midjourney、豆包、文心一言、腾讯元宝、智谱清言、海螺 AI、可灵、即梦、讯飞星火和 Manus 使用随应用打包的 24×24 单色 SVG。爱奇艺和阿里云盘仍用首字占位：前者待确认使用权限，后者官网 favicon 只有 16px，且不能用“阿里云”公司标志代替产品标志。来源见 [图标来源清单](public/service-icons/SOURCES.md)。图标随应用打包，无需在运行时向第三方请求。

## 数据分析

GA4
Measurement ID: G-4ZZ79CB412
Production only.
Does not load in development.
