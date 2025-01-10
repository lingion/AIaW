# 进阶部署

下载源码并切换到最新 tag：

```bash
git clone https://github.com/NitroRCr/AIaW.git
cd AIaW
git checkout -f $(git describe --tags $(git rev-list --tags --max-count=1))
```

## 环境变量

在 `.env.docker` 中设定用于 Docker 构建前端的环境变量。

其中，`DOC_PARSE_BASE_URL` 和 `CORS_FETCH_BASE_URL` 默认为后端提供的接口，无需修改。

### 配置云同步

`DEXIE_DB_URL` 是 [DexieCloud](https://dexie.org/cloud/) 数据库地址，如果需要云同步功能则需要配置。

确保当前环境安装了 NodeJS；创建 Dexie 数据库：

```bash
npx dexie-cloud create
```

你会被提示验证邮箱。然后在控制台输出中能看到创建的数据库地址，将其填入 `DEXIE_DB_URL` 变量。

将你的域名添加到白名单中：

```bash
npx dexie-cloud whitelist https://yourdomain.com
```

你可以在 [DexieCloud Manager](https://manager.dexie.cloud/) 管理在你的部署中注册的用户。

值得注意的是，Dexie Cloud 的免费计划额度为 100MB 储存空间、3 个 prod 用户，再往上则需要付费。

### 模型服务

开箱即用的模型服务是我们的部署（[aiaw.app](https://aiaw.app)）独有的，相关后端暂未开源，不过并不复杂。如果你想启用这个功能，可以基于 LiteLLM 自行实现。

实现后，你可以配置 `LITELLM_BASE_URL` 和 `BUDGET_BASE_URL`，以提供接口。此外，可以配置 `SYNC_SERVICE_PRICE` 和 `USD_TO_CNY_RATE`，它们分别是云同步服务的显示价格和USD/CNY汇率（用于模型价格显示）。它们只影响前端显示，具体付费逻辑取决于后端实现。

## 构建镜像

在 `.env.docker` 设定好环境变量后，构建镜像：

```bash
docker build -t my-aiaw .
```

## 部署

部署方式和快速部署一样，只是换成你构建的镜像。

```bash
docker run -d -p 9010:9010 --name my-aiaw my-aiaw
```

同样，可以传入 `LLAMA_CLOUD_API_KEY` 以启用文档解析，或是使用 Docker Compose：

```yaml
services:
  aiaw:
    image: my-aiaw
    container_name: my-aiaw
    restart: unless-stopped
    ports:
      - '9010:9010'
    environment:
      LLAMA_CLOUD_API_KEY: xxxxxxx
```

## 静态部署

不使用 Docker，仅将前端静态部署，也是一个选项。

你仍然可以配置前面所述的那些前端构建环境变量，不过将其写在 `.env.local`，而不是 `.env.docker` 中。

然后构建前端（确保安装了 pnpm）：

```bash
pnpm install

# 构建为 PWA，输出在 dist/pwa
pnpm build -m pwa

# 或者构建为普通 SPA，输出在 dist/spa
pnpm build
```

最后，部署输出的静态文件。

## 功能对照表

再次附上不同部署方式的功能对照表：

| 功能 \ 部署方式 | 静态部署（仅前端） | Docker 快速部署 | 进阶部署（自行构建） | aiaw.app |
| --- | --- | --- | --- | --- |
| 基本功能 | √ | √ | √ | √ |
| 插件市场/助手市场/Gradio插件 | √ | √ | √ | √ |
| LobeChat插件 | × | √ | √ | √ |
| 文档解析插件 | × | 需要 `LLAMA_CLOUD_API_KEY` | 需要 `LLAMA_CLOUD_API_KEY` | √ |
| 云同步 | 需配置 DexieCloud | × | 需配置 DexieCloud | √ |
| 开箱即用的模型服务 | × | × | × | √ |
