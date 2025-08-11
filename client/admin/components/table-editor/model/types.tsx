export type ExampleTable = {
  id: string;
};

export type CampaignTask = {
  id: string;
  description: string;
  campaign: string;
  lead: number;
  type: string;
  status: string;
  folder: string;
};

export type Setting = {
  id: string;
  description: string;
  value: string;
};

export type Schedule = {
  id: string;
  description: string;
  url: string;
  cron: string;
  status: string;
};

export type CampaignType = {
  id: string;
  description: string;
  lead: number;
};

export type Campaign = {
  id: string;
  name: string;
  theme: string;
  start: {
    date: string;
    time: string;
  };
  end: {
    date: string;
    time: string;
  };
  type: string;
  channels: string[];
};

export type Prompt = {
  id: string;
  value: string;
};
