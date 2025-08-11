import { Campaign, TaskStatus } from '../contracts';
import { RestClient } from '../core/rest-client';
import { WingResponse } from '../response/wing-response';

const baseUrl = '/api/dashboard';

export class MarketingService {
  private static client = new RestClient(baseUrl);

  private static encode(value: string): string {
    return encodeURIComponent(value);
  }

  static async createCampaign(campaign: Campaign): Promise<WingResponse> {
    const response = await this.client.post<WingResponse>('/campaign/create', campaign);
    return response;
  }
  
  static async updateCampaign(campaign: Campaign): Promise<WingResponse> {
    const response = await this.client.post<WingResponse>('/campaign/update', campaign);
    return response;
  }

  static async deleteCampaign(campaign: Campaign): Promise<WingResponse> {
    const response = await this.client.post<WingResponse>('/campaign/delete', campaign);
    return response;
  }

  static async getCampaign(id: string): Promise<WingResponse> {
    const response = await this.client.get<WingResponse>(`/campaign/get?id=${this.encode(id)}`);
    return response;
  }

  static async getCampaigns(status: TaskStatus): Promise<WingResponse> {
    const response = await this.client.get<WingResponse>(`/campaign/list?status=${this.encode(status)}`);
    return response;
  }
} 