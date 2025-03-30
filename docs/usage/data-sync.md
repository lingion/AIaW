# Data and Synchronization

In AIaW, all user data, including workspaces, assistants, conversations, messages, settings, etc., is first stored locally. This makes switching workspaces/conversations without loading and can be browsed offline. After logging in, cloud synchronization will be automatically enabled, and user data directly connected to multiple devices of the same account will be synchronized in real time, providing a good cross-device/cross-platform experience.

Cloud synchronization is a paid feature. After registering an account, you will get a 30-day cloud synchronization trial, and then you need to pay to use the cloud synchronization function. Charging is because there is a cost, and the charging price is not high (¥1.8 or $0.4 per month).

::: tip
The above description only applies to our official website (aiaw.app) and client. For self-deployed websites, whether there is a cloud synchronization function depends on whether DexieCloud is configured during deployment, and we do not provide services.
:::

## Data Export and Import

You can export/import user data at the bottom of the "Settings" page. This feature allows you to back up/restore user data, or migrate data between different sites (such as official clients and self-deployed websites).

It should be noted that this function cannot be used to transfer data between two logged-in accounts on the same site, because there will be primary key conflicts.
