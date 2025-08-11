import { Media } from './media';

export class Medias {
  public map: Map<string, Media>

  constructor(public urls: string[]) {
    this.map = new Map();
    for (const url of urls?? []) {
      this.map.set(url, new Media(url, ''));
    }
  }

  public get(url: string): Media {
    return url ? this.map.get(url) : undefined;
  }
  
  public get hasVideo(): boolean {
    for (const [, mediaUrl] of this.map) {
      if (mediaUrl.isVideo) {
        return true;
      }
    }

    return false;
  }

  public get hasImage(): boolean {
    for (const [, mediaUrl] of this.map) {
      if (mediaUrl.isImage) {
        return true;
      }
    }

    return false;
  }
  
  public get isTextPost(): boolean {
    const result = !(this.hasVideo || this.hasImage)

    return result;
  }

  public get hasMedia(): boolean {
    return this.urls && this.urls.length > 0;
  }

  public get isCarousel(): boolean {
    return this.urls.length > 1;
  }

  public get count(): number {
    if (this.hasMedia) {
      return this.urls.length;
    }

    return 0;
  }

  [Symbol.iterator](): Iterator<Media> {
    return this.map.values();
  }

  toString(): string {
    let result = '';
    for (const [key, media] of this.map) {
      result += `${key} => ${media}\n`;
    }
    return result.trim();
  }
} 