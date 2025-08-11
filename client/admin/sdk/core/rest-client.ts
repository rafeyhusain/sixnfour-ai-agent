import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

export class RestClient {
  private client: AxiosInstance;
  private logger: Console;
  
  constructor(baseUrl: string) {
    this.logger = console;
    this.client = axios.create({ baseURL: baseUrl });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        this.logger.log(`[RestClient] Request:`, config);
        return config;
      },
      (error: AxiosError) => {
        this.logger.error(`[RestClient] Request error:`, error);
        return Promise.reject(error);
      }
    );
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        this.logger.log(`[RestClient] Response:`, response);
        return response;
      },
      (error: AxiosError) => {
        this.logger.error(`[RestClient] Response error:`, error);
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      this.logger.error(`[RestClient] GET ${url} failed:`, error);
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      this.logger.error(`[RestClient] POST ${url} failed:`, error);
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      this.logger.error(`[RestClient] PUT ${url} failed:`, error);
      throw error;
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      this.logger.error(`[RestClient] DELETE ${url} failed:`, error);
      throw error;
    }
  }
} 