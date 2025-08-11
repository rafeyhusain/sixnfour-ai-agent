import { MarketingAgent } from '@awing/marketing-agent'
import { config } from '@awing/config-plugin';

const agent = MarketingAgent.getInstance(config.db.absPath);

export { agent }; // Export the singleton agent instance
