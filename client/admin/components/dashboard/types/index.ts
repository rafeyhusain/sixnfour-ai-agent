export class Restaurant {
    id: string = "";
    name: string = "";
    address: string = "";
    phone: string = "";
    email: string = "";
    website: string = "";
    logo: string = "";
    coverImage: string = "";
    description: string = "";
    cuisine_type: string = "";
    brand_voice: string = "";
    target_audience: string = "";
    special_features: string[] = [];
    operating_hours: string = "";

    static async list(): Promise<Restaurant[]> {
        // INSERT_YOUR_CODE
        return [
            {
                id: "1",
                name: "Six & Four",
                address: "Restaurant location to be added",
                phone: "Phone number to be added",
                email: "contact@sixnfour.com",
                website: "https://www.facebook.com/sixnfour",
                logo: "/assets/sixnfour-logo.png",
                coverImage: "/assets/sixnfour-cover.jpg",
                description: "A restaurant featured on Facebook with Six & Four branding.",
                cuisine_type: "To be determined",
                brand_voice: "Modern and engaging",
                target_audience: "",
                special_features: [],
                operating_hours: ""
            },
            {
                id: "2",
                name: "The Golden Spoon",
                address: "123 Main St, Springfield",
                phone: "555-1234",
                email: "info@goldenspoon.com",
                website: "https://goldenspoon.com",
                logo: "/assets/goldenspoon-logo.png",
                coverImage: "/assets/goldenspoon-cover.jpg",
                description: "A cozy place for gourmet delights.",
                cuisine_type: "Italian",
                brand_voice: "Casual and friendly",
                target_audience: "",
                special_features: [],
                operating_hours: "",
            },
            {
                id: "3",
                name: "Pasta Palace",
                address: "456 Elm St, Springfield",
                phone: "555-5678",
                email: "hello@pastapalace.com",
                website: "https://pastapalace.com",
                logo: "/assets/pastapalace-logo.png",
                coverImage: "/assets/pastapalace-cover.jpg",
                description: "Authentic Italian cuisine in the heart of the city.",
                cuisine_type: "Italian",
                brand_voice: "Casual and friendly",
                target_audience: "",
                special_features: [],
                operating_hours: "",
            },

        ];
    }

    static async filter(filters: Partial<Restaurant>): Promise<Restaurant[]> {
        const allRestaurants = await Restaurant.list();
        
        return allRestaurants.filter(restaurant => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === undefined || value === null || value === "") {
                    return true; // Skip empty filters
                }
                
                const restaurantValue = restaurant[key as keyof Restaurant];
                
                // Handle array properties
                if (Array.isArray(value) && Array.isArray(restaurantValue)) {
                    return value.some(v => restaurantValue.includes(v));
                }
                
                // Handle string properties (case-insensitive)
                if (typeof value === 'string' && typeof restaurantValue === 'string') {
                    return restaurantValue.toLowerCase().includes(value.toLowerCase());
                }
                
                // Handle exact matches for other types
                return restaurantValue === value;
            });
        });
    }

    static async create(data: Partial<Restaurant>): Promise<Restaurant> {
        // INSERT_YOUR_CODE
        const newRestaurant = new Restaurant();
        Object.assign(newRestaurant, data);
        newRestaurant.id = Date.now().toString();
        return newRestaurant;
    }

    static async update(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
        // INSERT_YOUR_CODE
        const restaurant = new Restaurant();
        Object.assign(restaurant, data);
        restaurant.id = id;
        return restaurant;
    }
}

export class SocialPost {
    id: string = "";
    restaurantId: string = "";
    postType: string = "";
    content: string = "";
    imageUrl: string = "";
    createdAt: string = "";
    updatedAt: string = "";
    scheduledDate: string = "";
    isPublished: boolean = false;
    isDeleted: boolean = false;

    static async list(sort: string = ""): Promise<SocialPost[]> {
        if (!sort) {
            console.error('sort is undefined');
        }

        return [
            {
                id: "1",
                restaurantId: "1",
                postType: "daily_special",
                content: "Today's special: Spaghetti Carbonara",
                imageUrl: "/assets/carbonara.jpg",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
                scheduledDate: "2024-01-01",
                isPublished: true,
                isDeleted: false,
            },
            {
                id: "2",
                restaurantId: "2",
                postType: "seasonal_promotion",
                content: "Spring menu is here! Try our new spring rolls",
                imageUrl: "/assets/spring-rolls.jpg",
                createdAt: "2024-01-02",
                updatedAt: "2024-01-02",
                scheduledDate: "2024-01-02",
                isPublished: true,
                isDeleted: false,
            }
        ];
    }

    static async filter(filters: Partial<SocialPost>): Promise<SocialPost[]> {
        const allPosts = await SocialPost.list();
        
        return allPosts.filter(post => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === undefined || value === null || value === "") {
                    return true; // Skip empty filters
                }
                
                const postValue = post[key as keyof SocialPost];
                
                // Handle boolean properties
                if (typeof value === 'boolean') {
                    return postValue === value;
                }
                
                // Handle string properties (case-insensitive)
                if (typeof value === 'string' && typeof postValue === 'string') {
                    return postValue.toLowerCase().includes(value.toLowerCase());
                }
                
                // Handle exact matches for other types
                return postValue === value;
            });
        });
    }
}