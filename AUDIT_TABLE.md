# AIaW Fork 全量改动审计表（含 Commit 证据链）

**VERSION_BASELINE**: upstream/master `054b9f5` → fork/master `085d6ec`
**Audit date**: 2026-06-02
**223 commits | 69 files changed | +5526 / -689 lines**
**Diff 全量对比**: https://github.com/NitroRCr/AIaW/compare/master...lingion:AIaW:master

---

## 一、移动端原生能力（上游：无）

| 功能模块 | 痛点（上游现状） | 解决方案 | 关键 Commit(s) | 改动文件 |
|---|---|---|---|---|
| iOS 构建路径 | 上游只有 Web+Android，iOS 只是"源码路径保留" | 完整添加 Xcode 项目，iOS 可直接构建 | `7bc163d`…`c879e66`（70+ commits） | `ios/` 整个目录新增 |
| 原生相机拍照 | 上游只能从相册选图 | `@capacitor/camera` 集成 + 重试对话框 | `0e2b39d` `9253053` `3a75a26` | `src/components/UnifiedInput.vue` |
| 密码/Key 可见性切换 | API Key 输入框全部遮盖 | 所有 password 字段添加 show/hide 切换 | `5d92f66` `a958fda` `61643ea` | `src/components/ProviderInputItems.vue` |
| Token 历史管理 | 上游 API Key 输入无历史 | Token 历史下拉 + 删除 + 按 provider 隔离 + 备注 | `1538567` `b8a7628` `4a4f75f` | `src/components/ProviderInputItems.vue` `src/stores/providers.ts` |
| 本地文件系统 | 上游移动端无法操作设备文件 | `local-fs-native-plugin` | `6035413` | `src/utils/local-fs-native.ts` `src/utils/local-fs-native-plugin.ts` |
| iOS 真机兼容 | 上游 iOS 路径未验证 | MCP gating + provider 兼容 + camera 权限 | `5bc7dd3`…`b85f957`（9 commits） | `src/utils/platform-api.ts` `src/composables/install-plugin.ts` |

## 二、AI Provider 增强（上游：基础支持）

| 功能模块 | 痛点 | 解决方案 | 关键 Commit(s) | 改动文件 |
|---|---|---|---|---|
| Cerebras 提供商 | 上游无 Cerebras | 一等公民集成 + 默认模型列表 | `759fb86` `93ff5c3` | `src/stores/providers.ts` |
| MiniMax 提供商 | 上游无 MiniMax | 一等公民 + think block 提取 + tool call 后最终答案合成 | `759fb86` `d57e384` `1977f06` `d775441` | `src/utils/dialog-message-map.js` `src/views/DialogView.vue` |
| MiniMax 流式修复 | 流式响应中断时直接报错 | fallback 非流式 | `ba336b3` | `src/utils/dialog-message-map.js` |
| 自定义 Provider | 创建后不激活、模型列表失败、运行时解析断裂 | 自动激活 + 手动输入 fallback + resolution chain 修复 | `174e849` `877d7fe` `7608f02` `c0f5cf6` `ded3b39` `53a4411` `5eff309` `f20e51b` `95d3b81` | `src/stores/providers.ts` `src/views/DialogView.vue` `src/components/CustomProviders.vue` |

## 三、图片交互（上游：无移动端图片操作）

| 功能模块 | 痛点 | 解决方案 | 关键 Commit(s) | 改动文件 |
|---|---|---|---|---|
| 图片长按死锁 | Android WebView 长按图片→震动+手势死锁 | CSS `pointer-events:none + touch-callout:none` | `63d9fe4` | `src/css/app.scss` |
| 图片全屏预览 | 上游无全屏看图 | `ViewImageDialog` 全屏沙箱 | `ddf165c` `7622fc6` `b111fa8` `b3c357d` `9de1662` `8e203cf` | `src/components/ViewImageDialog.vue`（新增）`src/components/MessageItem.vue` |
| Pivot-Point 双指缩放 | — | 以手指中点为圆心缩放 `transform-origin:0 0` | `9de1662` | `src/components/ViewImageDialog.vue` |
| 图片保存 | 上游无移动端保存 | `platformFetch → Filesystem.writeFile` 写入 `Documents/AiaW/` | `7d575bf` `9d5029c` | `src/components/ViewImageDialog.vue` `src/utils/platform-api.ts` |
| medium-zoom 冲突 | md-editor-v3 内置 zoom 与自定义手势死锁 | `noImgZoomIn: true` 禁用 | `63d9fe4` | `src/composables/md-preview-props.ts` |
| Material Icons 崩溃 | `icon="close"` 在 WebView 渲染成巨大文字 | 纯内联 SVG 替代 | `7622fc6` | `src/components/ViewImageDialog.vue` |
| Tap 退出判定 | 拖拽误触关闭 | touchstart→touchend 位移<5px 才关闭 | `8e203cf` | `src/components/ViewImageDialog.vue` |

## 四、导出系统（上游：无导出功能）

| 功能模块 | 痛点 | 解决方案 | 关键 Commit(s) | 改动文件 |
|---|---|---|---|---|
| 对话导出 | 上游无法导出对话 | HTML/Markdown 双通道 Dialog 选择 | `ef59c0f` | `src/composables/export-pdf.ts`（新增） |
| HTML 高保真渲染 | 手写正则→公式碎裂 | 直接抓 md-preview 已渲染 DOM | `7137fa7` | `src/composables/export-pdf.ts` |
| 精准 DOM 抓取 | `querySelector` 抓错元素 | `getElementById(mdId)` 按消息 ID 定位 | `9f204ad` | `src/composables/export-pdf.ts` `src/components/MessageItem.vue` |
| 防死锁 | DOM 失败→JS 中断→弹窗不弹 | Dialog 先弹，DOM 在 onOk 后抓，try-catch 全链路 | `1f0f0b4` | `src/composables/export-pdf.ts` |
| 离线可用 | HTML 依赖 CDN，断网公式变源码 | 页面 stylesheet KaTeX CSS 内联 + CDN fallback | `2dd6b8f` `8c86370` | `src/composables/export-pdf.ts` |
| KaTeX 容错 | 个别公式出错→整页崩溃 | `throwOnError:false + trust:true` | `8c86370` | `src/composables/export-pdf.ts` |
| 文件名可读 | 数据库 ID 命名 | 内容前8字+时间戳 | `bcfde61` `f4d7814` | `src/composables/export-pdf.ts` |
| 数据库导出 | 大数据量 OOM | chunked 分块写入 + 进度条 + lightweight 模式 | `66a1fb1` `1fb479c` `abcb85a` `c596534` `d6c3a0d` `32a0696` | `src/components/ExportDataDialog.vue` `src/components/ImportDataDialog.vue` |

## 五、UI/UX 与视觉一致性

| 功能模块 | 痛点 | 解决方案 | 关键 Commit(s) | 改动文件 |
|---|---|---|---|---|
| 全局 Toast 系统 | 散落 Notify.create 风格不统一 | `useToast` composable + `GlobalToast` 全局组件 | `1733b3d` `6d6ece6` `a0a3018` | `src/composables/useToast.ts`（新增）`src/components/GlobalToast.vue`（新增）`src/App.vue` |
| Toast 手势上划 | Quasar swipeDismiss 真机无效 | 自写 touchstart/move/end + translateY 动画 | `a0a3018` | `src/composables/useToast.ts` `src/components/ViewImageDialog.vue` |
| 主题色统一 | Quasar 默认黄色 warning | 全局 CSS `var(--q-primary)` !important 覆盖 | `5487cce` `b561d76` | `src/css/app.scss` |
| 用户气泡排版 | 行距过大，单/多行不一致 | line-height 1.6 + para gap 16px + breaks:true | `67f07c4` `e71e203` `4a78deb` `15b9189` `af9e2f3` `ebb83e2` `1fb3c47` `252a967` | `src/components/MessageItem.vue` `src/css/app.scss` |
| 聊天布局修复 | 发送按钮偏移、输入框不圆角、插件菜单头像丢失 | 全面修复 composer 对齐+圆角+插件图标 | `e3b133f` `cb0df1e` `6035413` `6339fb1` `e75bac4` `f4412d0` `cda61bc` `fee9602` | `src/views/DialogView.vue` `src/components/UnifiedInput.vue` |
| 对话分支竞态 | 分支跳转时上下文错乱 | regenerate/skip branch 竞态修复 | `8ea207d` | `src/views/DialogView.vue` |

## 六、MCP 与插件系统

| 功能模块 | 痛点 | 解决方案 | 关键 Commit(s) | 改动文件 |
|---|---|---|---|---|
| MCP 插件刷新 | 安装后需重启 | 添加刷新按钮 | `3a75a26` | `src/components/InstalledPlugins.vue` |
| 移动端插件过滤 | 显示不支持的 STDIO 插件 | 隐藏移动端不可用插件 | `c7e2f18` | `src/components/EnablePluginsMenu.vue` |
| MCP Provider 设置 | 配置不灵活 | 暴露 settings 到插件配置 | `48f4e17` `67e2201` | `src/composables/install-plugin.ts` |

## 七、数据与隐私（去云同步）

| 功能模块 | 痛点 | 解决方案 | 关键 Commit(s) | 改动文件 |
|---|---|---|---|---|
| 去云同步 | 上游默认启用 dexie-cloud | 禁用云同步 | `6b406ba` `9c7ff41` | `src/composables/set-theme.ts` |
| 去托管服务 | 上游引导登录 hosted service | 移除所有登录引导 + 简化 onboarding | `43af792` `5290d0c` `0647592` | `src/composables/first-visit.ts` `src/composables/migration-alert.ts` |
| 迁移告警 | 上游弹跨版本迁移提示 | 禁用 | `9853b62` | `src/composables/migration-alert.ts` |
| 更新通道 | 指向上游原作者 | 指向 lingion fork release feed | `8aecd69` `38863ed` | `src/utils/update.ts` |

## 八、构建与发布链

| 功能模块 | 痛点 | 解决方案 | 关键 Commit(s) | 改动文件 |
|---|---|---|---|---|
| JDK 17 兼容 | AGP 8.7.2 要求 JDK 21 | `VERSION_21→VERSION_17` patch | 构建时 sed | `android/app/build.gradle` |
| 版本管理 | 上游无 release 版本号 | versionCode + versionName + tag + APK asset | `e1fe68f` `3de8661` `86754c6` `c8ae020` | `android/app/build.gradle` `package.json` |
| Live Update 控制 | 调试时远程覆盖本地前端 | 可禁用 live-update | `464f051` | `src/utils/update.ts` |
| Android 资源 | 上游默认 Android 图标/主题 | 自定义 reskin | `9c18748` | `android/app/src/main/res/` |
