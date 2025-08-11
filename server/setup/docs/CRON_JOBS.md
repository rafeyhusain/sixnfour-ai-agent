
# Cron Jobs

| ID       | Description                                                                 | Cron Expression   | Status |
| -------- | --------------------------------------------------------------------------- | ----------------- | ------ |
| schedule | Schedule marketing content for the event every **3 minutes**.               | `0 */3 * * * *`   | idle   |
| generate | Generate marketing content for the event every **10 minutes**.              | `20 */10 * * * *` | idle   |
| publish  | Publish the generated content to the selected channels every **5 minutes**. | `20 */5 * * * *`  | idle   |
