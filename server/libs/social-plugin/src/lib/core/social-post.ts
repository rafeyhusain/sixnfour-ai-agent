import { Medias } from "./medias";

export class SocialPost {
  content?: string;
  medias?: Medias;
  hashtags?: string[];
  altTexts?: string[];

  constructor(content?: string, mediaUrls?: string[], hashtags?: string[], altTexts?: string[]) {
    this.content = content;
    this.hashtags = hashtags;
    this.altTexts = altTexts;
    this.medias = new Medias(mediaUrls);
  }

  public get message(): string {
    let message = this.content;

    if (this.hashtags && this.hashtags.length > 0) {
      message += '\n\n' + this.formatHashtags(this.hashtags);
    }

    return message;
  }

  protected formatHashtags(hashtags?: string[]): string {
    if (!hashtags || hashtags.length === 0) {
      return '';
    }
    return hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
  }

  get length(): number {
    return this.content.length;
  }

  get empty(): boolean {
    return !this.content || this.content.trim().length === 0;
  }

  static sample(debugUrl: boolean = true, imageCount: number = 0, videoCount: number = 0, imageUrl?: string, videoUrl?: string): SocialPost {
    let post = {
      caption: "Celebrate World Oceans Day! 🌊",
      post: "Join us in protecting our blue planet. Every action counts. #WorldOceansDay",
      hashtags: ["WorldOceansDay", "ProtectOurOceans", "BluePlanet"]
    };

    imageUrl = imageUrl ?? 'https://siwi.org/wp-content/uploads/2023/06/s2s_world-oceans-day_qa.jpg.webp';
    videoUrl = videoUrl ?? 'https://videos.pexels.com/video-files/8297964/8297964-hd_720_1280_30fps.mp4';

    if (debugUrl) {
      imageUrl = './debug/apps/services/marketing-service/src/assets/db/photos/courage.jpg';
      videoUrl = './debug/apps/services/marketing-service/src/assets/db/videos/3mb.mp4'
    }

    const imageUrls = [];
    const videoUrls = [];

    for (let i = 0; i < imageCount; i++) {
      imageUrls.push(imageUrl);
    }

    for (let i = 0; i < videoCount; i++) {
      videoUrls.push(videoUrl);
    }

    const mediaUrls = [...imageUrls, ...videoUrls];

    return new SocialPost(
      `${post.caption}\n${post.post}`,
      mediaUrls,
      post.hashtags
    );
  }
}