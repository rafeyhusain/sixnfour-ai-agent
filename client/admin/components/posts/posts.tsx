import { useEffect, useState } from "react";
import { DashboardService } from "@/sdk/services/dashboard-service";
import { SpinnerStrip } from "@/components/wingui/spinner-strip/spinner-strip";
import { Campaign, Post } from "@/sdk/contracts";
import { PostComponent } from "./post";

interface PostsProps {
  campaign: Campaign;
  date: Date;
}

export function Posts({ campaign, date }: PostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaign || !date) return;
    setLoading(true);
    DashboardService.getPosts(campaign.id, date).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, [campaign, date]);

  if (loading) return <SpinnerStrip show={true} size="medium" text="Loading posts..." />;

  return (!posts || posts.length === 0 ? (
    <div className="text-center py-8">
      <div className="text-gray-500 mb-4">
        <p className="text-lg font-medium mb-2">No posts found</p>
        <p className="text-sm">There are no posts generated or published for this campaign.</p>
      </div>
    </div>
  ) : (
    <div className="space-y-2">
      {posts.map((post) => (
        <PostComponent key={post.id} post={post} />
      ))}
    </div>
  ));
} 