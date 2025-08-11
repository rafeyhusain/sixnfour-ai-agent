import { Post, Medias } from '../contracts';
import { RestClient } from '../core/rest-client';
import { CampaignTask } from '../contracts/campaign-task';
import { CalendarEvent } from '@/components/wingui/wing-calendar/calendar/calendar-types';
import { WingResponse } from '../response/wing-response';
import { Campaign } from '../model/campaign';
import { Pair } from '../model/pair';

const baseUrl = '/api/dashboard';

export class DashboardService {
  private static client = new RestClient(baseUrl);

  private static encode(value: string): string {
    return encodeURIComponent(value);
  }

  static async getTableNames(): Promise<string[]> {
    const response = await this.client.get<WingResponse>(`/table/list`);
    return response.data as string[];
  }

  static async getTable<T>(name: string): Promise<T[]> {
    const response = await this.client.get<WingResponse>(`/table/get?name=${this.encode(name)}`);
    return response.data as T[];
  }

  static async getCampaigns(): Promise<Campaign[]> {
    const response = await this.client.get<WingResponse>(`/content/campaign/list`);
    return response.data as Campaign[];
  }
  
  static async getCampaignEvents(campaign: string): Promise<Pair[]> {
    const campaignEncoded = this.encode(campaign);

    const response = await this.client.get<WingResponse>(`/content/campaign/event/list?campaign=${campaignEncoded}`);
    return response.data as Pair[];
  }

  
  static async getPosts(campaign: string, event: Date): Promise<Post[]> {
    const campaignEncoded = this.encode(campaign);
    const eventEncoded = this.encode(event.toISOString());
    const response = await this.client.get<WingResponse>(`/content/campaign/post/list?campaign=${campaignEncoded}&event=${eventEncoded}`);
    return response.data as Post[];
  }
  
  static async setTable<T>(name: string, json: T[]): Promise<WingResponse> {
    const response = await this.client.post<WingResponse>('/table/set', {
      name,
      json: JSON.stringify(json),
    });
    return response;
  }

  static async loadCampaign(id: string): Promise<Campaign | undefined> {
    const campaigns = await this.getCampaigns();
    return campaigns.find(c => c.id === id);
  }

  static async getEvents(date: Date): Promise<CalendarEvent[]> {
    const campaigns = await this.getTable<Campaign>('campaigns');
    const campaignTasks = await this.getTable<CampaignTask>('campaign-tasks');

    const events: CalendarEvent[] = [];

    for (const campaign of campaigns) {
      const campaignModel = new Campaign(campaign);
      const campaignEvents = await campaignModel.getEvents(date, campaignTasks);
      events.push(...campaignEvents);
    }

    return events;
  }

  // Media endpoints
  static async getMedia(): Promise<Medias[]> {
    const response = await this.client.get<WingResponse>(`/media/list`);
    return response.data as Medias[];
  }

  static async getMediaById(id: string): Promise<Medias | undefined> {
    const response = await this.client.get<WingResponse>(`/media/get?id=${this.encode(id)}`);
    return response.data as Medias;
  }

  static async createMedia(mediaData: Partial<Medias>): Promise<Medias> {
    const response = await this.client.post<WingResponse>('/media/create', mediaData);
    return response.data as Medias;
  }

  static async updateMedia(id: string, mediaData: Partial<Medias>): Promise<Medias> {
    const response = await this.client.put<WingResponse>(`/media/update?id=${this.encode(id)}`, mediaData);
    return response.data as Medias;
  }

  static async deleteMedia(id: string): Promise<Medias> {
    const response = await this.client.delete<WingResponse>(`/media/delete?id=${this.encode(id)}`);
    return response.data as Medias;
  }

  static async uploadMedia(file: File): Promise<Medias> {
    // Convert file to base64 for upload
    const base64Data = await this.fileToBase64(file);
    const fileData = {
      filename: file.name,
      data: base64Data,
      mimetype: file.type
    };
    
    const response = await this.client.post<WingResponse>('/media/upload', fileData);
    return response.data as Medias;
  }

  static async searchMedia(tags: string[]): Promise<Medias[]> {
    const tagsParam = tags.join(',');
    const response = await this.client.get<WingResponse>(`/media/search?tags=${this.encode(tagsParam)}`);
    return response.data as Medias[];
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
} 