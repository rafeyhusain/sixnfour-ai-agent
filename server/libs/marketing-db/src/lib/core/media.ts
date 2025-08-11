export enum MediaType {
  Image = 'image',
  Video = 'video',
  Text = 'text'
}

export type ProtocolType = 'http' | 'https' | 'file' | 'data' | 'unknown';

export class Media {
  constructor(public url: string, public altText: string) { }

  get protocol(): ProtocolType {
    try {
      return new URL(this.url).protocol.replace(':', '') as any;
    } catch {
      return 'unknown';
    }
  }

  get isLocalhost(): boolean {
    try {
      const host = new URL(this.url).hostname;
      return host === 'localhost' || host === '127.0.0.1';
    } catch {
      return false;
    }
  }

  get isHttp(): boolean {
    return this.protocol === 'http';
  }

  get isHttps(): boolean {
    return this.protocol === 'https';
  }

  get extension(): string {
    return this.url.split('.').pop()?.split('?')[0].toLowerCase() || '';
  }

  get isValid(): boolean {
    return /^https?:\/\/|^file:\/\//.test(this.url);
  }

  get isWebUrl(): boolean {
    return /^https?:\/\//i.test(this.url);
  }

  get isVideo(): boolean {
    return /\.(mp4|mov|avi|wmv|flv|mkv|webm)(\?.*)?$/i.test(this.url);
  }

  get isImage(): boolean {
    return /\.(jpe?g|png|gif|bmp|webp|tiff?|svg)(\?.*)?$/i.test(this.url);
  }

  get isDebug(): boolean {
    return this.url.startsWith('./debug');
  }

  get isFileName(): boolean {
    // Check if url does not start with http, https, file, or data, and is not a number
    // and matches the pattern fileName.ext (no slashes, at least one dot, no protocol)
    const url = this.url;
    // Not a protocol
    if (/^(https?:|file:|data:)/i.test(url)) return false;
    // Not a number
    if (/^\d+$/.test(url)) return false;
    // No slashes allowed
    if (/[\\/]/.test(url)) return false;
    // Must match fileName.ext (at least one char, a dot, at least one char)
    return /^[^\/\\]+?\.[a-zA-Z0-9]+$/.test(url);
  }
  
  get debugUrl(): string {
    if (this.isDebug) {
      return this.url.replace('./debug', 'C:/data/seawingai/git/ai-marketing-agent');
    }

    return this.url;
  }

  toString(): string {
    return this.url;
  }
}