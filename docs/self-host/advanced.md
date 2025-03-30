# Advanced Deployment

Download the source code and switch to the latest tag:

```bash
git clone https://github.com/NitroRCr/AIaW.git
cd AIaW
git checkout -f $(git describe --tags $(git rev-list --tags --max-count=1))
```

## Environment Variables

Set the environment variables for Docker building the front-end in `.env.docker`.

Among them, `DOC_PARSE_BASE_URL` and `CORS_FETCH_BASE_URL` are the interfaces provided by the backend by default and do not need to be modified.

### Configure Cloud Synchronization

`DEXIE_DB_URL` is the [DexieCloud](https://dexie.org/cloud/) database address. If you need cloud synchronization, you need to configure it.

Make sure NodeJS is installed in the current environment; create a Dexie database:

```bash
npx dexie-cloud create
```

You will be prompted to verify your email. Then you can see the created database address in the console output, and fill it into the `DEXIE_DB_URL` variable.

This command will also generate `dexie-cloud.json` and `dexie-cloud.key` in the current directory, the latter of which contains the private key with full permissions to the database. **Please keep it safe and do not make it public.**

Add your domain name to the whitelist:

```bash
npx dexie-cloud whitelist https://yourdomain.com
```

You can manage users registered in your deployment in the [DexieCloud Manager](https://manager.dexie.cloud/).

It is worth noting that Dexie Cloud's free plan has a quota of 100MB of storage space and 3 prod users, and you need to pay for more.

For more information, see [DexieCloud Documentation](https://dexie.org/cloud/#getting-started)

### Model Service

The out-of-the-box model service is unique to our deployment ([aiaw.app](https://aiaw.app)). The relevant backend is not yet open source, but it is not complicated. If you want to enable this feature, you can implement it yourself based on LiteLLM.

After implementation, you can configure `LITELLM_BASE_URL` and `BUDGET_BASE_URL` to provide interfaces. In addition, you can configure `SYNC_SERVICE_PRICE` and `USD_TO_CNY_RATE`, which are the display price of the cloud synchronization service and the USD/CNY exchange rate (for model price display), respectively. They only affect the front-end display, and the specific payment logic depends on the back-end implementation.

## Build Image

After setting the environment variables in `.env.docker`, build the image:

```bash
docker build -t my-aiaw .
```

## Deployment

The deployment method is the same as the quick deployment, except that you switch to the image you built.

```bash
docker run -d -p 9010:9010 --name my-aiaw my-aiaw
```

Similarly, you can pass in `LLAMA_CLOUD_API_KEY` to enable document parsing, or use Docker Compose:

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

## Static Deployment

It is also an option to deploy the front-end statically without using Docker.

You can still configure the front-end build environment variables mentioned earlier, but write them in `.env.local` instead of `.env.docker`.

Then build the front-end (make sure pnpm is installed):

```bash
pnpm install

# Build as PWA, output in dist/pwa
pnpm build -m pwa

# Or build as a normal SPA, output in dist/spa
pnpm build
```

Finally, deploy the output static files.

## Feature Comparison Table

Here is the feature comparison table of different deployment methods again:

| Feature \ Deployment Method | Static Deployment (Frontend Only) | Quick Docker Deployment | Advanced Deployment (Self-Built) | aiaw.app |
| --- | --- | --- | --- | --- |
| Basic Features | √ | √ | √ | √ |
| Plugin Market / Assistant Market / Gradio Plugins | √ | √ | √ | √ |
| LobeChat Plugins | × | √ | √ | √ |
| Document Parsing Plugin | × | Requires `LLAMA_CLOUD_API_KEY` | Requires `LLAMA_CLOUD_API_KEY` | √ |
| Cloud Synchronization | Requires DexieCloud Configuration | × | Requires DexieCloud Configuration | √ |
| Out-of-the-Box Model Service | × | × | × | √ |
