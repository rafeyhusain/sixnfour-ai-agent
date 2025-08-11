"use client";
import React, { useState, useEffect } from "react";
import { Restaurant, SocialPost } from "@/components/dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Settings,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isToday } from "date-fns";

import StatsOverview from "@/components/dashboard/StatsOverview";
import RecentPosts from "@/components/dashboard/RecentPosts";
import UpcomingPosts from "@/components/dashboard/UpcomingPosts";
import QuickActions from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const restaurants = await Restaurant.list();
      const allPosts = await SocialPost.list('-scheduledDate');
      
      if (restaurants.length > 0) {
        setRestaurant(restaurants[0]);
      }
      setPosts(allPosts);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const thisMonthPosts = posts.filter(post => {
    const postDate = new Date(post.scheduledDate);
    const now = new Date();
    return postDate >= startOfMonth(now) && postDate <= endOfMonth(now);
  });

  const todayPosts = posts.filter(post => isToday(new Date(post.scheduledDate)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome to AI Social Marketing
              </h1>
              <p className="text-gray-600 text-lg">
                {restaurant ? 
                  `Managing social media for ${restaurant.name}` : 
                  "AI-powered social media calendar for restaurants"
                }
              </p>
            </div>
            
            {!restaurant && !isLoading ? (
              <Link href="/dashboard/setup">
                <Button className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white shadow-lg">
                  <Settings className="w-5 h-5 mr-2" />
                  Setup Restaurant
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/generate">
                <Button className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white shadow-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Posts
                </Button>
              </Link>
            )}
          </div>
        </div>

        {!restaurant && !isLoading ? (
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Let's Set Up Your Restaurant
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                First, we need some basic information about your restaurant to create personalized social media content.
              </p>
              <Link href="/dashboard/setup">
                <Button size="lg" className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <StatsOverview 
              posts={posts}
              thisMonthPosts={thisMonthPosts}
              todayPosts={todayPosts}
              isLoading={isLoading}
            />

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <UpcomingPosts posts={posts.slice(0, 5)} isLoading={isLoading} />
                <RecentPosts posts={posts.slice(0, 8)} isLoading={isLoading} />
              </div>
              
              <div>
                <QuickActions restaurant={restaurant} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
