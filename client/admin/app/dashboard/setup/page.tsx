"use client";
import React, { useState, useEffect } from "react";
import { Restaurant } from "@/components/dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Utensils, MapPin, Globe, Users, Mic, Save, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RestaurantSetup() {     
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    website_url: "",
    cuisine_type: "",
    brand_voice: "",
    target_audience: "",
    special_features: [] as string[],
    operating_hours: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [existingRestaurant, setExistingRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    loadExistingRestaurant();
  }, []);

  const loadExistingRestaurant = async () => {
    try {
      const restaurants = await Restaurant.list();
      if (restaurants.length > 0) {
        const restaurant = restaurants[0];
        setExistingRestaurant(restaurant);
        setFormData({
          name: restaurant.name,
          address: restaurant.address,
          website_url: restaurant.website,
          cuisine_type: restaurant.cuisine_type,
          brand_voice: restaurant.brand_voice,
          target_audience: restaurant.target_audience,
          special_features: restaurant.special_features,
          operating_hours: restaurant.operating_hours
        });
      }
    } catch (error) {
      console.error("Error loading restaurant:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (existingRestaurant) {
        await Restaurant.update(existingRestaurant.id, formData);
      } else {
        await Restaurant.create(formData);
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving restaurant:", error);
    }
    setIsLoading(false);
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      special_features: prev.special_features.includes(feature)
        ? prev.special_features.filter(f => f !== feature)
        : [...prev.special_features, feature]
    }));
  };

  const specialFeatureOptions = [
    "Outdoor Seating", "Live Music", "Private Dining", "Delivery Available",
    "Takeout", "Bar Area", "Kids Menu", "Vegan Options", "Gluten-Free Options",
    "Wine Selection", "Craft Beer", "Happy Hour", "Catering", "Events Hosting"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-6 border-amber-200 hover:bg-amber-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {existingRestaurant ? "Update Restaurant Profile" : "Set Up Your Restaurant"}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tell us about your restaurant so we can create personalized social media content that matches your brand and audience.
            </p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-xl">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Restaurant Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    <Utensils className="w-4 h-4 inline mr-2" />
                    Restaurant Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Bella Vista Italian"
                    className="border-amber-200 focus:border-amber-400"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="website_url" className="text-sm font-semibold text-gray-700">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Website URL
                  </Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://yourrestaurant.com"
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Full Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Main Street, City, State 12345"
                  className="border-amber-200 focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Cuisine Type
                  </Label>
                  <Select value={formData.cuisine_type} onValueChange={(value) => setFormData({...formData, cuisine_type: value})}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400">
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="thai">Thai</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="steakhouse">Steakhouse</SelectItem>
                      <SelectItem value="seafood">Seafood</SelectItem>
                      <SelectItem value="pizza">Pizza</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="bakery">Bakery</SelectItem>
                      <SelectItem value="fast_casual">Fast Casual</SelectItem>
                      <SelectItem value="fine_dining">Fine Dining</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    <Mic className="w-4 h-4 inline mr-2" />
                    Brand Voice
                  </Label>
                  <Select value={formData.brand_voice} onValueChange={(value) => setFormData({...formData, brand_voice: value})}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400">
                      <SelectValue placeholder="Select brand voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly_casual">Friendly & Casual</SelectItem>
                      <SelectItem value="upscale_elegant">Upscale & Elegant</SelectItem>
                      <SelectItem value="family_friendly">Family Friendly</SelectItem>
                      <SelectItem value="trendy_modern">Trendy & Modern</SelectItem>
                      <SelectItem value="traditional_classic">Traditional & Classic</SelectItem>
                      <SelectItem value="health_conscious">Health Conscious</SelectItem>
                      <SelectItem value="adventurous_bold">Adventurous & Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="target_audience" className="text-sm font-semibold text-gray-700">
                  <Users className="w-4 h-4 inline mr-2" />
                  Target Audience
                </Label>
                <Textarea
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  placeholder="Describe your ideal customers (e.g., families with children, young professionals, date night couples, food enthusiasts...)"
                  className="border-amber-200 focus:border-amber-400 h-24"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Special Features
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specialFeatureOptions.map((feature) => (
                    <div key={feature}>
                      <Badge
                        variant={formData.special_features.includes(feature) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 ${
                          formData.special_features.includes(feature)
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "border-amber-200 hover:bg-amber-50 text-gray-700"
                        }`}
                        onClick={() => handleFeatureToggle(feature)}
                      >
                        {feature}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="operating_hours" className="text-sm font-semibold text-gray-700">
                  Operating Hours
                </Label>
                <Input
                  id="operating_hours"
                  value={formData.operating_hours}
                  onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                  placeholder="e.g., Mon-Thu: 11am-10pm, Fri-Sat: 11am-11pm, Sun: 12pm-9pm"
                  className="border-amber-200 focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white px-8 py-3 text-lg"
                >
                  {isLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {existingRestaurant ? "Update Restaurant" : "Save & Continue"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}