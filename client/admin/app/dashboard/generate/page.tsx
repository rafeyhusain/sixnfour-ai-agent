"use client";
import React, { useState, useEffect } from "react";
import { Restaurant, SocialPost } from "@/components/dashboard/types";
// import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowLeft, 
  Calendar as CalendarIcon,
  Wand2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { format, getDaysInMonth, startOfMonth } from "date-fns";

export default function Generate() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [existingPosts, setExistingPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (restaurant) {
      checkExistingPostsForMonth();
    }
  }, [selectedMonth, restaurant]);

  const loadData = async () => {
    try {
      const restaurants = await Restaurant.list();
      if (restaurants.length > 0) {
        setRestaurant(restaurants[0]);
      } else {
        setError("Please set up your restaurant first");
      }
    } catch (error) {
      setError("Error loading restaurant data");
    }
  };

  const checkExistingPostsForMonth = async () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthName = format(monthStart, 'yyyy-MM');
    const allPosts = await SocialPost.filter({ restaurantId: restaurant?.id });
    const postsInMonth = allPosts.filter(p => p.scheduledDate.startsWith(monthName));
    setExistingPosts(postsInMonth);
  };

  const generateMonthlyCalendar = async () => {
//     if (!restaurant) return;

//     setIsGenerating(true);
//     setProgress(0);
//     setError(null);
//     setGeneratedPosts([]);

//     const daysInMonth = getDaysInMonth(selectedMonth);
//     const monthFormatted = format(selectedMonth, "MMMM yyyy");
//     const yearMonthPrefix = format(selectedMonth, "yyyy-MM");

//     try {
//       setCurrentStep(`Creating content strategy for ${monthFormatted}...`);
//       setProgress(10);

//       const calendarPrompt = `Create a comprehensive social media calendar for a ${restaurant.cuisine_type} restaurant called "${restaurant.name}" for the month of ${monthFormatted}.

// Restaurant Details:
// - Address: ${restaurant.address}
// - Website: ${restaurant.website_url || 'N/A'}
// - Brand Voice: ${restaurant.brand_voice}
// - Target Audience: ${restaurant.target_audience || 'General dining audience'}
// - Special Features: ${restaurant.special_features?.join(', ') || 'Standard dining'}
// - Operating Hours: ${restaurant.operating_hours || 'Standard hours'}

// Generate exactly ${daysInMonth} social media posts (one for each day of ${monthFormatted}), ensuring a mix of post types.
// Each post must have a date within ${monthFormatted} (using YYYY-MM-DD format starting from ${yearMonthPrefix}-01).

// Each post should include:
// - A specific, unique date in YYYY-MM-DD format.
// - A post type category.
// - An engaging title.
// - A compelling caption (150-250 characters).
// - Relevant hashtags (5-8).
// - A call to action.
// - An engagement goal.

// Return exactly ${daysInMonth} posts in the specified JSON format.`;

//       const calendarResponse = await InvokeLLM({
//         prompt: calendarPrompt,
//         response_json_schema: {
//           type: "object",
//           properties: {
//             posts: {
//               type: "array",
//               items: {
//                 type: "object",
//                 properties: {
//                   scheduled_date: { type: "string" },
//                   post_type: { type: "string" },
//                   title: { type: "string" },
//                   content: { type: "string" },
//                   hashtags: { type: "array", items: { type: "string" } },
//                   call_to_action: { type: "string" },
//                   engagement_goal: { type: "string" }
//                 }
//               }
//             }
//           }
//         }
//       });

//       setProgress(30);
//       setCurrentStep("Processing generated content...");

//       const posts = calendarResponse.posts || [];
//       if (posts.length === 0) {
//           throw new Error("The AI did not generate any posts. Please try again.");
//       }
      
//       setProgress(50);
//       setCurrentStep("Generating AI images for posts...");

//       const postsWithImages = [];
//       for (let i = 0; i < posts.length; i++) {
//         const post = posts[i];
//         try {
//           const imagePrompt = `Create a high-quality, appetizing food photography image for a ${restaurant.cuisine_type} restaurant social media post. 
          
// Post details: ${post.title} - ${post.content}
// Restaurant style: ${restaurant.brand_voice}
// Context: ${post.post_type}

// Style: Professional food photography, warm lighting, appetizing presentation, restaurant quality, social media optimized, vibrant colors, clean background.`;

//           const imageResult = await GenerateImage({ prompt: imagePrompt });
          
//           postsWithImages.push({
//             ...post,
//             restaurant_id: restaurant.id,
//             image_url: imageResult.url,
//             platform_optimized: ["instagram", "facebook"]
//           });
//         } catch (imageError) {
//           postsWithImages.push({
//             ...post,
//             restaurant_id: restaurant.id,
//             platform_optimized: ["instagram", "facebook"]
//           });
//         }
//         setProgress(50 + Math.round(((i + 1) / posts.length) * 40));
//         setCurrentStep(`Generated image for post ${i + 1} of ${posts.length}...`);
//       }

//       setProgress(95);
//       setCurrentStep("Saving posts to your calendar...");

//       await SocialPost.bulkCreate(postsWithImages);

//       setProgress(100);
//       setCurrentStep(`Complete! Content for ${monthFormatted} is ready.`);
//       setGeneratedPosts(postsWithImages);
      
//       setTimeout(() => {
//         router.push("/dashboard/calendar");
//       }, 2000);

//     } catch (error: any) {
//       setError(`Error generating calendar: ${error.message}`);
//       setIsGenerating(false);
//     }
  };

  const changeMonth = (amount: number) => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };
  
  if (!restaurant && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8 flex items-center justify-center">
        <p>Loading restaurant data...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Restaurant Setup Required
              </h2>
              <p className="text-gray-600 mb-8">
                Please set up your restaurant profile first to generate personalized content.
              </p>
              <Button 
                onClick={() => router.push("/dashboard/setup")}
                className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white"
              >
                Set Up Restaurant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-6 border-amber-200 hover:bg-amber-50"
            disabled={isGenerating}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Generate Monthly Content
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Create a complete month of personalized social media content for {restaurant.name}.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-xl">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              AI Calendar Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isGenerating ? (
              <div className="space-y-8">
                <div className="flex justify-center items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="text-2xl font-semibold text-amber-800 w-48 text-center">
                    {format(selectedMonth, 'MMMM yyyy')}
                  </h3>
                  <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {existingPosts.length > 0 ? (
                  <Alert variant="default" className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Content for {format(selectedMonth, 'MMMM yyyy')} has already been generated. You can view it in the calendar.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">What you'll get:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-amber-600" />
                        <span className="text-gray-700">{getDaysInMonth(selectedMonth)} unique posts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Wand2 className="w-5 h-5 text-amber-600" />
                        <span className="text-gray-700">AI-generated images</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <Button
                    onClick={generateMonthlyCalendar}
                    size="lg"
                    disabled={existingPosts.length > 0}
                    className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white px-12 py-4 text-lg"
                  >
                    <Sparkles className="w-6 h-6 mr-3" />
                    Generate Monthly Calendar
                  </Button>
                  <p className="text-sm text-gray-500 mt-4">
                    This process takes 1-2 minutes per month.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Creating Your AI Calendar...
                  </h3>
                  <p className="text-gray-600 mb-8">{currentStep}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-amber-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {generatedPosts.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <h4 className="font-semibold text-green-900">
                        Successfully Generated {generatedPosts.length} Posts!
                      </h4>
                    </div>
                    <p className="text-green-700">
                      Redirecting to your calendar view...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}