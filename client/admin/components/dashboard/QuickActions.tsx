import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Settings, Sparkles } from "lucide-react";
import { Restaurant } from './types';

export default function QuickActions({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link href="/dashboard/calendar" className="block">
          <Button variant="outline" className="w-full justify-start border-amber-200 hover:bg-amber-50">
            <Calendar className="w-4 h-4 mr-3" />
            View Calendar
          </Button>
        </Link>
        
        <Link href="/dashboard/generate" className="block">
          <Button variant="outline" className="w-full justify-start border-amber-200 hover:bg-amber-50">
            <Sparkles className="w-4 h-4 mr-3" />
            Generate New Posts
          </Button>
        </Link>
        
        <Link href="/dashboard/setup" className="block">
          <Button variant="outline" className="w-full justify-start border-amber-200 hover:bg-amber-50">
            <Settings className="w-4 h-4 mr-3" />
            Update Restaurant
          </Button>
        </Link>

        <div className="pt-4 border-t border-amber-200">
          <h4 className="font-semibold text-gray-900 mb-3">Restaurant Info</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium">{restaurant?.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Cuisine:</span>
              <p className="font-medium capitalize">{restaurant?.cuisine_type?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <span className="text-gray-600">Voice:</span>
              <p className="font-medium capitalize">{restaurant?.brand_voice?.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}