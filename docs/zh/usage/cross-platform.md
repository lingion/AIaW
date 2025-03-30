# 跨平台

AIaW 是跨平台的，我们提供了不同平台（Windows、Linux、Mac OS 和 Android）的本地客户端，同时有网页版（PWA）。

本地客户端可在 [GitHub Releases](https://github.com/NitroRCr/AIaW/releases/latest) 下载，网页版可访问 [aiaw.app](https://aiaw.app) 或者[自部署](/self-host/)。

大部分功能在所有平台都是可用的。本地客户端相较于网页版，避免了跨域 API 调用的限制（适用于少数不允许跨域调用的服务商）。此外，桌面版（Win、Linux、Mac）添加了对 STDIO 类型 [MCP 插件](mcp)的支持。

## 网页版

得益于响应式的界面设计，网页版适配不同大小和比例的屏幕。你可以在手机、电脑等不同设备上通过浏览器使用。

### 浏览器兼容性

为了良好的兼容性和使用体验，建议使用基于较新版本 Chromium 内核的浏览器（Chrome、新Edge等）

### PWA 安装

网页版同时也是 [PWA应用](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps)（Progressive Web Application）。PWA 可以直接安装，安装后会在桌面或者“开始”创建快捷方式。通过快捷方式将从独立的窗口打开应用。

这样，PWA 实现了和本地应用一致的便捷性和使用体验，同样支持离线浏览，同时还保留了热更新、轻量等网页的优势。

安装按钮一般在地址栏右侧（PC）或者浏览器菜单中（手机）

![](res/pc-install-btn.png "Chrome 桌面端")

<img src="./res/mobile-install-btn.webp" width="300px" title="Chrome 移动端">

