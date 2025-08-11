

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Camera, TrendingUp, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialPost } from './types';

export default function StatsOverview({ posts, thisMonthPosts, todayPosts, isLoading }: { posts: SocialPost[], thisMonthPosts: SocialPost[], todayPosts: SocialPost[], isLoading: boolean }) {
  const stats = [
    {
      title: "Total Posts",
      value: posts.length,
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      title: "This Month",
      value: thisMonthPosts.length,
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100"
    },
    {
      title: "With Images",
      value: posts.filter(post => post.imageUrl).length,
      icon: Camera,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100"
    },
    {
      title: "Today's Posts",
      value: todayPosts.length,
      icon: Target,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} rounded-full transform translate-x-8 -translate-y-8 opacity-20`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}