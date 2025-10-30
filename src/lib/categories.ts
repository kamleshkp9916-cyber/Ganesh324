
export type Subcategory = {
    name: string;
    description: string;
};

export type Category = {
    id: string;
    name: string;
    subcategories: Subcategory[];
};

export const defaultCategories: Category[] = [
    { 
        id: 'women',
        name: "Women", 
        subcategories: [
            { name: "Tops", description: "Blouses, T-shirts, tanks, and more." },
            { name: "Dresses", description: "Casual, formal, and everything in between." },
            { name: "Coats & Jackets", description: "Stay warm and stylish with our outerwear." },
            { name: "Pants", description: "From casual chinos to professional trousers." },
            { name: "Jeans", description: "Find your perfect fit and wash." },
            { name: "Swim & Cover-Ups", description: "Get ready for the beach or pool." },
            { name: "Bras, Underwear & Lingerie", description: "Comfortable and supportive essentials." },
            { name: "Activewear", description: "Performance gear for your workouts." },
            { name: "Pajamas & Robes", description: "Cozy up in our comfortable sleepwear." }
        ] 
    },
    { 
        id: 'men',
        name: "Men", 
        subcategories: [
            { name: "Shirts", description: "Casual, dress, and polo shirts." },
            { name: "Pants & Shorts", description: "Chinos, trousers, and casual shorts." },
            { name: "Coats & Jackets", description: "Outerwear for all seasons." },
            { name: "Activewear", description: "Workout gear for the modern man." },
            { name: "Jeans", description: "A wide range of fits and styles." },
            { name: "Underwear & Socks", description: "Daily essentials for comfort." },
            { name: "Pajamas & Robes", description: "Comfortable sleepwear and loungewear." },
            { name: "Suits & Tuxedos", description: "Sharp looks for formal occasions." }
        ] 
    },
    { 
        id: 'kids',
        name: "Kids", 
        subcategories: [
            { name: "Girls' Clothing", description: "Dresses, tops, and sets for girls." },
            { name: "Boys' Clothing", description: "Shirts, pants, and outfits for boys." },
            { name: "Baby Clothing", description: "Adorable and soft essentials for babies." },
            { name: "Toys & Games", description: "Fun and educational toys for all ages." },
            { name: "Backpacks", description: "Stylish and durable backpacks for school." }
        ] 
    },
    { 
        id: 'home',
        name: "Home", 
        subcategories: [
            { name: "Bedding", description: "Sheets, duvets, and comforters." },
            { name: "Bath", description: "Towels, mats, and shower curtains." },
            { name: "Rugs", description: "Area rugs for every room." },
            { name: "Furniture", description: "Sofas, tables, and storage solutions." },
            { name: "Home Decor", description: "Vases, wall art, and more." },
            { name: "Kitchen", description: "Cookware, bakeware, and gadgets." }
        ] 
    },
    { 
        id: 'electronics',
        name: "Electronics", 
        subcategories: [
            { name: "Computers & Laptops", description: "The latest from top brands." },
            { name: "Smartphones & Accessories", description: "Phones, cases, and chargers." },
            { name: "TV & Home Theater", description: "Immerse yourself in entertainment." },
            { name: "Cameras & Drones", description: "Capture life's best moments." },
            { name: "Headphones & Audio", description: "High-fidelity sound on the go." },
            { name: "Video Games", description: "Consoles, games, and accessories." }
        ] 
    },
    { 
        id: 'shoes',
        name: "Shoes", 
        subcategories: [
            { name: "Women's Shoes", description: "Heels, flats, boots, and sneakers." },
            { name: "Men's Shoes", description: "Dress shoes, sneakers, and casuals." },
            { name: "Kids' Shoes", description: "Durable and stylish shoes for kids." }
        ] 
    },
    { 
        id: 'handbags',
        name: "Handbags", 
        subcategories: [
            { name: "Totes", description: "Spacious and stylish tote bags." },
            { name: "Crossbody Bags", description: "Hands-free convenience and style." },
            { name: "Shoulder Bags", description: "Classic and elegant shoulder bags." },
            { name: "Clutches", description: "Perfect for evenings and special events." },
            { name: "Backpacks", description: "Fashionable and functional backpacks." }
        ] 
    },
    { 
        id: 'trending',
        name: "Trending", 
        subcategories: [
            { name: "New Arrivals", description: "The latest additions to our store." },
            { name: "Best Sellers", description: "See what's popular with our customers." },
            { name: "Top Rated", description: "The highest-rated products." }
        ] 
    },
    { 
        id: 'sale',
        name: "Sale", 
        subcategories: [
            { name: "Women's Sale", description: "Great deals on women's fashion." },
            { name: "Men's Sale", description: "Discounts on men's clothing and more." },
            { name: "Kids' Sale", description: "Savings on clothing and toys for kids." },
            { name: "Home Sale", description: "Find deals for every room." }
        ] 
    },
];

export const CATEGORIES_KEY = 'streamcart_categories';
