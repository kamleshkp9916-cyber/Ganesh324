
export const productDetails = {
    'prod_1': { id: 1, key: 'prod_1', name: 'Vintage Camera', brand: 'RetroCam', category: 'Electronics', subcategory: 'Cameras & Drones', price: '₹12,500.00', images: ['https://images.unsplash.com/photo-1497008323932-4f726e0f13f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHx2aW50YWdlJTIwY2FtZXJhfGVufDB8fHx8MTc1NjI4NzMwOHww&ixlib=rb-4.1.0&q=80&w=1080', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'vintage camera', description: 'A classic 35mm film camera from the 70s. Fully functional with a sharp 50mm f/1.8 lens. Perfect for enthusiasts and collectors. Captures authentic vintage-style photos with a distinct, nostalgic feel.', modelNumber: 'RC-1975', origin: 'Japan', highlights: "Sharp 50mm f/1.8 Lens\nFully manual controls\nAuthentic vintage aesthetic\nDurable metal body", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), stock: 15, sold: 125, availableSizes: "Silver, Black", isFromStream: true, keywords: ["vintage", "camera", "retrocam", "electronics", "cameras", "drones", "film", "35mm", "silver", "black", "vintag", "vinta", "vint", "vin", "camer", "came", "cam"] },
    'prod_2': { id: 2, key: 'prod_2', name: 'Wireless Headphones', brand: 'SoundWave', category: 'Electronics', subcategory: 'Headphones & Audio', price: '₹4,999.00', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxoZWFkcGhvbmVzfGVufDB8fHx8MTc1NjI4NzMwOHww&ixlib_rb-4.1.0&q=80&w=1080', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'headphones', description: 'Experience immersive sound with these noise-cancelling over-ear headphones. Features a 20-hour battery life, plush earcups for all-day comfort, and crystal-clear microphone for calls.', modelNumber: 'SW-PRO2', origin: 'USA', highlights: "Active Noise Cancellation\n20-hour battery life\nCrystal-clear microphone\nBluetooth 5.2 Connectivity", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), stock: 50, sold: 830, availableColors: "Midnight Black, Arctic White, Rose Gold", isFromStream: true, keywords: ["wireless", "headphones", "soundwave", "electronics", "audio", "noise-cancelling", "bluetooth", "black", "white", "gold", "wireles", "headphon", "headpho", "headph"] },
    'prod_3': { id: 3, key: 'prod_3', name: 'Handcrafted Vase', brand: 'Artisan Home', category: 'Home', subcategory: 'Home Decor', price: '₹2,100.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'ceramic vase', description: 'A beautiful, minimalist ceramic vase, handcrafted by local artisans. Its elegant design complements any home decor style. Each piece is unique.', origin: 'India', highlights: "Handcrafted by local artisans\nMinimalist design\nMade from ethically sourced clay", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), stock: 0, sold: 45, keywords: ["handcrafted", "vase", "artisan", "home", "decor", "ceramic", "minimalist", "handcrafte", "handcraft"] },
    'prod_4': { id: 4, key: 'prod_4', name: 'Smart Watch', brand: 'TimeWarp', category: 'Electronics', subcategory: 'Smartphones & Accessories', price: '₹8,750.00', images: ['https://images.unsplash.com/photo-1579721840641-7d0e67f1204e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxzbWFydCUyMHdhdGNofGVufDB8fHx8MTc1NjI4NzMwOHww&ixlib-rb-4.1.0&q=80&w=1080', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'smart watch', description: 'Stay connected and track your fitness with this advanced smartwatch. Features a vibrant AMOLED display, heart rate monitoring, GPS, and a wide range of smart notifications.', modelNumber: 'TW-X1', origin: 'China', highlights: "Vibrant AMOLED Display\nHeart Rate & SpO2 Monitoring\nBuilt-in GPS\n5-day battery life", createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), stock: 30, sold: 450, keywords: ["smart", "watch", "timewarp", "electronics", "fitness", "tracker", "amoled", "gps", "smartwatc", "smartwa"] },
    'prod_5': { id: 5, key: 'prod_5', name: 'Leather Backpack', brand: 'UrbanCarry', category: 'Handbags', subcategory: 'Backpacks', price: '₹6,200.00', images: ['https://images.unsplash.com/photo-1622560482357-789dc8a50923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxicm93biUyMGxlYXRoZXIlMjBiYWNrcGFja3xlbnwwfHx8fDE3NTYyODczMDh8MA&ixlib=rb-4.1.0&q=80&w=1080', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'brown leather backpack', description: 'A stylish and durable handmade genuine leather backpack. With multiple compartments, it is perfect for daily use, work, or short trips. Ages beautifully over time.', size: 'L', color: 'Tan Brown', origin: 'India', highlights: "Genuine Full-Grain Leather\nMultiple compartments including laptop sleeve\nHand-stitched for durability", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), stock: 20, sold: 98, keywords: ["leather", "backpack", "urbancarry", "handbags", "bags", "brown", "handmade", "laptop", "leather", "backpac"] },
    'prod_6': { id: 6, key: 'prod_6', name: 'Fitness Mat', brand: 'ZenFlex', category: 'Home', subcategory: 'Home Decor', price: '₹1,500.00', images: ['https://placehold.co/600x600.png'], hint: 'fitness mat', description: 'High-density foam mat for all types of yoga, pilates, and floor exercises. Non-slip surface ensures stability.', origin: 'Vietnam', highlights: "High-density foam\nNon-slip surface\nIncludes carrying strap", createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), stock: 100, sold: 320, keywords: ["fitness", "mat", "zenflex", "home", "yoga", "pilates", "exercise", "fitnes"] },
    'prod_7': { id: 7, key: 'prod_7', name: 'Pottery Kit', brand: 'ClayWorks', category: 'Home', subcategory: 'Home Decor', price: '₹3,000.00', images: ['https://placehold.co/600x600.png'], hint: 'pottery kit', description: 'A complete starter kit for pottery enthusiasts, including clay, tools, and a guide.', origin: 'India', highlights: "Includes 1kg air-dry clay\n8-piece toolset\nBeginner-friendly guide book", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), stock: 25, sold: 80, keywords: ["pottery", "kit", "clayworks", "home", "craft", "hobby", "diy", "potter"] },
    'prod_8': { id: 8, key: 'prod_8', name: 'Dog Bed', brand: 'Pawsome', category: 'Home', subcategory: 'Home Decor', price: '₹2,500.00', images: ['https://placehold.co/600x600.png'], hint: 'dog bed', description: 'An orthopedic dog bed for maximum comfort and joint support for your furry friend.', origin: 'China', highlights: "Orthopedic memory foam\nMachine-washable cover\nAvailable in 3 sizes", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), stock: 40, sold: 150, keywords: ["dog", "bed", "pawsome", "pet", "supplies", "orthopedic", "memory foam"] },
    'prod_9': { id: 9, key: 'prod_9', name: 'Signed Novel', brand: 'Bookish', category: 'Trending', subcategory: 'New Arrivals', price: '₹1,800.00', images: ['https://placehold.co/600x600.png'], hint: 'book cover', description: 'A first edition novel, signed by the author. A must-have for collectors.', origin: 'United Kingdom', highlights: "First edition print\nHand-signed by the author\nIncludes certificate of authenticity", createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), stock: 5, sold: 2, keywords: ["signed", "novel", "bookish", "trending", "book", "author", "first edition", "signe"] },
    'prod_10': { id: 10, key: 'prod_10', name: 'Gaming Mouse', brand: 'ClickFast', category: 'Electronics', subcategory: 'Video Games', price: '₹4,200.00', images: ['https://placehold.co/600x600.png'], hint: 'gaming mouse', description: 'An ergonomic gaming mouse with customizable RGB lighting and programmable buttons.', modelNumber: 'CF-ZPRO', origin: 'Taiwan', highlights: "16,000 DPI sensor\nCustomizable RGB lighting\n8 programmable buttons", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), stock: 60, sold: 210, keywords: ["gaming", "mouse", "clickfast", "electronics", "video games", "rgb", "esports", "gamin"] },
    'prod_11': { id: 11, key: 'prod_11', name: 'Denim Jacket', brand: 'Urban Threads', category: 'Women', subcategory: 'Coats & Jackets', price: '₹3,200.00', images: ['https://images.unsplash.com/photo-1596700204352-c82d33d3140a?w=800&h=800&fit=crop'], hint: 'denim jacket', description: 'A timeless denim jacket with a modern fit. Perfect for layering in any season.', size: 'M', color: 'Blue', highlights: "Classic wash\nSlightly oversized fit\n100% cotton", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), stock: 35, sold: 180, availableSizes: "S, M, L, XL", availableColors: "Light Wash, Dark Wash, Black", keywords: ["denim", "jacket", "urban", "threads", "women", "coats", "blue", "s", "m", "l", "xl", "light wash", "dark wash", "black", "deni"] },
    'prod_12': { id: 12, key: 'prod_12', name: 'Floral Maxi Dress', brand: 'Summer Bloom', category: 'Women', subcategory: 'Dresses', price: '₹2,800.00', images: ['https://images.unsplash.com/photo-1579626539953-33973641a2a4?w=800&h=800&fit=crop'], hint: 'floral dress', description: 'A flowy and elegant maxi dress with a vibrant floral print. Ideal for vacations or summer events.', size: 'S', color: 'Multicolor', highlights: "Lightweight fabric\nAdjustable straps\nSide slit for movement", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), stock: 45, sold: 250, availableSizes: "XS, S, M, L", keywords: ["floral", "maxi", "dress", "summer", "bloom", "women", "dresses", "multicolor", "xs", "s", "m", "l", "flora"] },
    'prod_13': { id: 13, key: 'prod_13', name: 'Classic White Shirt', brand: 'Modern Man', category: 'Men', subcategory: 'Shirts', price: '₹1,999.00', images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&h=800&fit=crop'], hint: 'man white shirt', description: 'A crisp, white button-down shirt made from premium cotton. A versatile wardrobe staple.', size: 'L', color: 'White', highlights: "Premium 100% cotton\nSlim fit design\nMother-of-pearl buttons", createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), stock: 80, sold: 500, availableSizes: "S, M, L, XL, XXL", keywords: ["classic", "white", "shirt", "modern", "man", "men", "shirts", "s", "m", "l", "xl", "xxl", "classi"] },
    'prod_14': { id: 14, key: 'prod_14', name: 'Chino Shorts', brand: 'Casual Co.', category: 'Men', subcategory: 'Pants & Shorts', price: '₹1,500.00', images: ['https://images.unsplash.com/photo-1591357218684-a95781600298?w=800&h=800&fit=crop'], hint: 'men chino shorts', description: 'Comfortable and stylish chino shorts for any casual occasion. Made with a hint of stretch for all-day comfort.', size: '32', color: 'Khaki', highlights: "Cotton-stretch blend\n9-inch inseam\nFour-pocket styling", createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), stock: 120, sold: 600, availableSizes: "28, 30, 32, 34, 36", availableColors: "Khaki, Navy, Grey", keywords: ["chino", "shorts", "casual", "co", "men", "pants", "khaki", "navy", "grey", "28", "30", "32", "34", "36", "chin"] },
    'prod_15': { id: 15, key: 'prod_15', name: 'Vitamin C Serum', brand: "Glow", category: "Women", subcategory: "Skincare", price: '₹2,500.00', images: ['https://placehold.co/200x200.png?text=Serum'], hint: "skincare serum", description: 'Brightening serum for a radiant complexion.', highlights: "Brightens skin\nReduces dark spots", createdAt: new Date().toISOString(), stock: 50, sold: 200, keywords: ["vitamin", "c", "serum", "beauty", "skincare", "brightening", "women", "vitami"] },
    'prod_16': { id: 16, key: 'prod_16', name: 'Matte Lipstick', brand: "LuxeLips", category: "Women", subcategory: "Makeup", price: '₹1,200.00', images: ['https://placehold.co/200x200.png?text=Lipstick'], hint: "red lipstick", description: 'Long-lasting, bold matte lipstick.', highlights: "Vibrant color\nLong-wearing formula", createdAt: new Date().toISOString(), stock: 100, sold: 500, keywords: ["matte", "lipstick", "beauty", "makeup", "bold", "red", "women", "matt"] },
    'prod_17': { id: 17, key: 'prod_17', name: 'Eyeshadow Palette', brand: "ShadeCraft", category: "Women", subcategory: "Makeup", price: '₹3,500.00', images: ['https://placehold.co/200x200.png?text=Palette'], hint: "eyeshadow palette", description: 'A versatile palette with 12 shades.', highlights: "Pigmented shades\nMatte and shimmer finishes", createdAt: new Date().toISOString(), stock: 30, sold: 150, keywords: ["eyeshadow", "palette", "beauty", "makeup", "shimmer", "matte", "women", "eyeshado"] },
    'prod_18': { id: 18, key: 'prod_18', name: 'Hydrating Face Mask', brand: "AquaPure", category: "Women", subcategory: "Skincare", price: '₹800.00', images: ['https://placehold.co/200x200.png?text=Mask'], hint: "face mask", description: 'A deeply hydrating mask for supple skin.', highlights: "Intense hydration\nFor all skin types", createdAt: new Date().toISOString(), stock: 75, sold: 400, keywords: ["hydrating", "face", "mask", "beauty", "skincare", "hydration", "women", "hydratin"] },
    'prod_19': { id: 19, key: 'prod_19', name: 'Running Shoes', brand: 'QuickFlex', category: 'Shoes', subcategory: "Women's Shoes", price: '₹5,500.00', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop'], hint: 'running shoes', description: 'Lightweight and responsive running shoes for daily training.', size: '8', color: 'Red', highlights: "Breathable mesh upper\nCushioned midsole", createdAt: new Date().toISOString(), stock: 40, sold: 120, keywords: ["running", "shoes", "quickflex", "women", "sneakers", "red", "runnin"] },
    'prod_20': { id: 20, key: 'prod_20', name: 'Leather Loafers', brand: 'GentleStep', category: 'Shoes', subcategory: "Men's Shoes", price: '₹4,800.00', images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop'], hint: 'leather loafers', description: 'Classic leather loafers for a smart-casual look.', size: '10', color: 'Brown', highlights: "Genuine leather\nSlip-on design", createdAt: new Date().toISOString(), stock: 25, sold: 80, keywords: ["leather", "loafers", "gentlestep", "men", "shoes", "brown", "leathe"] },
    'prod_21': { id: 21, key: 'prod_21', name: 'Sun Hat', brand: 'SunShield', category: 'Women', subcategory: 'Accessories', price: '₹1,200.00', images: ['https://images.unsplash.com/photo-1533512937593-3505c24939b4?w=800&h=800&fit=crop'], hint: 'sun hat', description: 'A wide-brimmed sun hat for ultimate sun protection.', size: 'One Size', color: 'Beige', highlights: "UPF 50+ protection\nWide brim for shade", createdAt: new Date().toISOString(), stock: 60, sold: 300, keywords: ["sun", "hat", "sunshield", "women", "accessories", "beige", "beach"] },
    'prod_22': { id: 22, key: 'prod_22', name: 'Gold Necklace', brand: 'Aura Jewels', category: 'Women', subcategory: 'Jewelry & Watches', price: '₹9,500.00', images: ['https://images.unsplash.com/photo-1616723938481-81b4b8b7b4a2?w=800&h=800&fit=crop'], hint: 'gold necklace', description: 'A delicate 18k gold plated necklace with a minimalist pendant.', size: '18 inch', color: 'Gold', highlights: "18k Gold Plated\nMinimalist design", createdAt: new Date().toISOString(), stock: 15, sold: 50, keywords: ["gold", "necklace", "aura", "jewels", "women", "jewelry", "18k"] },
    'prod_23': { id: 23, key: 'prod_23', name: 'Linen Trousers', brand: 'BreezyWear', category: 'Men', subcategory: 'Pants', price: '₹2,500.00', images: ['https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&h=800&fit=crop'], hint: 'linen trousers', description: 'Lightweight and breathable linen trousers for warm weather.', size: 'M', color: 'Beige', highlights: "100% Linen\nDrawstring waist", createdAt: new Date().toISOString(), stock: 55, sold: 180, keywords: ["linen", "trousers", "breezywear", "men", "pants", "beige", "line"] },
    'prod_24': { id: 24, key: 'prod_24', name: 'Silk Scarf', brand: 'Elegance', category: 'Women', subcategory: 'Accessories', price: '₹1,800.00', images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=800&fit=crop'], hint: 'silk scarf', description: 'A luxurious silk scarf with a vibrant print.', size: 'One Size', color: 'Multicolor', highlights: "100% Mulberry Silk\nHand-rolled edges", createdAt: new Date().toISOString(), stock: 30, sold: 90, keywords: ["silk", "scarf", "elegance", "women", "accessories", "multicolor"] },
    'prod_25': { id: 25, key: 'prod_25', name: 'Blender', brand: 'KitchenPro', category: 'Home', subcategory: 'Kitchen', price: '₹3,200.00', images: ['https://images.unsplash.com/photo-1568205634629-41b9d4f2431b?w=800&h=800&fit=crop'], hint: 'kitchen blender', description: 'A powerful blender for smoothies, soups, and more.', highlights: "1200W motor\n1.5L glass jar", createdAt: new Date().toISOString(), stock: 20, sold: 120, keywords: ["blender", "kitchenpro", "home", "kitchen", "appliance", "smoothie", "blende"] },
    'prod_26': { id: 26, key: 'prod_26', name: 'Throw Pillow', brand: 'CozyHome', category: 'Home', subcategory: 'Home Decor', price: '₹900.00', images: ['https://images.unsplash.com/photo-1586798273767-2b810f639314?w=800&h=800&fit=crop'], hint: 'throw pillow', description: 'A plush velvet throw pillow to add a pop of color to your sofa.', size: '18x18 inch', color: 'Teal', highlights: "Velvet cover\nIncludes insert", createdAt: new Date().toISOString(), stock: 70, sold: 250, keywords: ["throw", "pillow", "cozyhome", "home", "decor", "cushion", "teal", "velvet", "thro"] },
    'prod_27': { id: 27, key: 'prod_27', name: 'Bluetooth Speaker', brand: 'AudioBlast', category: 'Electronics', subcategory: 'Headphones & Audio', price: '₹2,800.00', images: ['https://images.unsplash.com/photo-1594223274502-942be6e542e0?w=800&h=800&fit=crop'], hint: 'bluetooth speaker', description: 'A portable Bluetooth speaker with rich bass and waterproof design.', highlights: "IPX7 Waterproof\n12-hour playtime", createdAt: new Date().toISOString(), stock: 50, sold: 300, keywords: ["bluetooth", "speaker", "audioblast", "electronics", "audio", "portable", "waterproof", "bluetoot"] },
    'prod_28': { id: 28, key: 'prod_28', name: 'Kids T-Shirt', brand: 'LittleSprout', category: 'Kids', subcategory: "Boys' Clothing", price: '₹800.00', images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&h=800&fit=crop'], hint: 'kids t-shirt', description: 'A soft cotton t-shirt with a fun graphic print.', size: '4-5 Years', color: 'Blue', highlights: "100% Cotton\nTagless for comfort", createdAt: new Date().toISOString(), stock: 150, sold: 800, keywords: ["kids", "t-shirt", "littlesprout", "boys", "clothing", "blue", "cotton"] },
    'prod_29': { id: 29, key: 'prod_29', name: 'Girls Leggings', brand: 'StretchyPants', category: 'Kids', subcategory: "Girls' Clothing", price: '₹750.00', images: ['https://images.unsplash.com/photo-1519340241574-289a2b421515?w=800&h=800&fit=crop'], hint: 'girls leggings', description: 'Comfortable and durable leggings for everyday play.', size: '6-7 Years', color: 'Pink', highlights: "Cotton-spandex blend\nElastic waistband", createdAt: new Date().toISOString(), stock: 200, sold: 1200, keywords: ["girls", "leggings", "stretchypants", "kids", "clothing", "pink"] },
    'prod_30': { id: 30, key: 'prod_30', name: 'Basic Crewneck Tee', brand: 'Everyday', category: 'Women', subcategory: 'Tops', price: '₹999.00', images: ['https://images.unsplash.com/photo-1688111421202-bda886f5e215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHx3aGl0ZSUyMHQtc2hpcnR8ZW58MHx8fHwxNzYwNzMxNTYyfDA&ixlib=rb-4.1.0&q=80&w=1080'], hint: 'white t-shirt', description: 'A classic crewneck t-shirt made from soft, breathable cotton. A must-have basic.', size: 'M', color: 'White', highlights: "100% Pima Cotton\nRelaxed fit\nTagless for comfort", createdAt: new Date().toISOString(), stock: 250, sold: 1500, keywords: ["basic", "crewneck", "tee", "everyday", "women", "tops", "t-shirt", "white", "cotton"] },
    'prod_31': { id: 31, key: 'prod_31', name: 'Striped Tank Top', brand: 'SunChaser', category: 'Women', subcategory: 'Tops', price: '₹799.00', images: ['https://images.unsplash.com/photo-1758509167264-f8a68214901d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdHJpcGVkJTIwdGFuayUyMHRvcHxlbnwwfHx8fDE3NjA3Njg5NzB8MA&ixlib=rb-4.1.0&q=80&w=1080'], hint: 'striped tank top', description: 'A lightweight and breezy striped tank top, perfect for summer days.', size: 'S', color: 'Blue/White', highlights: "Linen blend fabric\nScoop neckline\nSide slits for a relaxed fit", createdAt: new Date().toISOString(), stock: 180, sold: 950, keywords: ["striped", "tank", "top", "sunchaser", "women", "tops", "summer", "blue", "white"] },
    'prod_32': { id: 32, key: 'prod_32', name: 'Silk Camisole', brand: 'Elegance', category: 'Women', subcategory: 'Tops', price: '₹1,800.00', images: ['https://images.unsplash.com/photo-1645654731316-a350fdcf3bae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzaWxrJTIwY2FtaXNvbGV8ZW58MHx8fHwxNzYwNzY2NjUxfDA&ixlib=rb-4.1.0&q=80&w=1080'], hint: 'silk camisole', description: 'A luxurious silk camisole with delicate lace trim. Perfect for layering or wearing on its own.', size: 'M', color: 'Black', highlights: "100% Mulberry Silk\nDelicate lace trim\nAdjustable spaghetti straps", createdAt: new Date().toISOString(), stock: 90, sold: 400, keywords: ["silk", "camisole", "elegance", "women", "tops", "black", "lace", "luxurious"] },
    'prod_33': { id: 33, key: 'prod_33', name: 'Turtleneck Bodysuit', brand: 'SleekFit', category: 'Women', subcategory: 'Tops', price: '₹1,550.00', images: ['https://images.unsplash.com/photo-1598300056463-1b0d2b4d773e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHx0dXJ0bGVuZWNrJTIwYm9keXN1aXR8ZW58MHx8fHwxNzYwNzY4NDM5fDA&ixlib=rb-4.1.0&q=80&w=1080'], hint: 'turtleneck bodysuit', description: 'A form-fitting turtleneck bodysuit, perfect for creating a seamless, tucked-in look.', size: 'M', color: 'Espresso', highlights: "Soft, stretchy fabric\nThong back for no panty lines\nSnap closure", createdAt: new Date().toISOString(), stock: 110, sold: 650, keywords: ["turtleneck", "bodysuit", "sleekfit", "women", "tops", "espresso", "brown"] }
};


export const mockStreams = [
    { id: 'fashionfinds-uid', title: 'Live Vintage Fashion Sale', hostId: 'fashionfinds-uid', status: 'live', startTime: Date.now() - 1000 * 60 * 15, thumbnail: 'https://placehold.co/400x225.png', productIds: ['prod_1', 'prod_11', 'prod_12'], keywords: ['live', 'sale', 'fashion', 'vintage', 'denim', 'dress'], isFeatured: true },
    { id: 'gadgetguru-uid', title: 'Unboxing the Latest Tech', hostId: 'gadgetguru-uid', status: 'live', startTime: Date.now() - 1000 * 60 * 30, thumbnail: 'https://placehold.co/400x225.png', productIds: ['prod_2', 'prod_4', 'prod_10'], keywords: ['tech', 'unboxing', 'gadgets', 'headphones', 'smart watch', 'gaming'], isFeatured: false },
    { id: 'homehaven-uid', title: 'Cozy Home Decor Ideas', hostId: 'homehaven-uid', status: 'ended', startTime: Date.now() - 1000 * 60 * 60 * 24, thumbnail: 'https://placehold.co/400x225.png', productIds: ['prod_3'], keywords: ['home', 'decor', 'cozy', 'vase', 'interior design'], isFeatured: false },
    { id: 'beautybox-uid', title: 'Evening Skincare Routine', hostId: 'beautybox-uid', status: 'upcoming', startTime: Date.now() + 1000 * 60 * 60 * 3, thumbnail: 'https://placehold.co/400x225.png', productIds: ['prod_15', 'prod_18'], keywords: ['skincare', 'beauty', 'routine', 'serum', 'mask'], isFeatured: true },
];

```
  </change>
  <change>
    <file>src/app/live-selling/page.tsx</file>
    <content><![CDATA[
"use client";

import Link from 'next/link';
import {
  Clapperboard,
  Home,
  Bookmark,
  Heart,
  Star,
  Zap,
  ChevronDown,
  Bell,
  Plus,
  Settings,
  Users,
  Menu,
  User,
  Award,
  MessageSquare,
  Shield,
  FileText,
  LifeBuoy,
  Wallet,
  ShoppingBag,
  LogOut,
  MoreHorizontal,
  Flag,
  Share2,
  MessageCircle,
  Clipboard,
  Hash,
  UserPlus,
  Video,
  Globe,
  File,
  X,
  ShoppingCart,
  Moon,
  Sun,
  Search,
  LayoutDashboard,
  Repeat,
  Laptop,
  Briefcase,
  RadioTower,
  Trash2,
  Send,
  ArrowUp,
  ArrowDown,
  Tv,
  Tags,
  Flame,
  TrendingUp,
  Save,
  Package,
  List,
  Sparkles,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/lib/auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CreatePostForm } from '@/components/create-post-form';
import { getCart } from '@/lib/product-history';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction, limit } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { format, formatDistanceToNow } from 'date-fns';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName } from '@/lib/follow-data';
import { productDetails } from '@/lib/product-data';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { Logo } from '@/components/logo';
import { categories } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { ProductSearchWithStreams } from '@/components/ProductSearchWithStreams';


const liveSellers = [
    { id: 'fashionfinds-uid', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1' },
    { id: 'gadgetguru-uid', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2' },
    { id: 'homehaven-uid', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3' },
    { id: 'beautybox-uid', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4' },
    { id: 'kitchenwiz-uid', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5' },
    { id: 'fitflow-uid', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6' },
    { id: 'artisanalley-uid', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7' },
    { id: 'petpalace-uid', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8' },
    { id: 'booknook-uid', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9' },
    { id: 'gamerguild-uid', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10' },
];

const reportReasons = [
    { id: "spam", label: "It's spam" },
    { id: "hate", label: "Hate speech or symbols" },
    { id: "false", label: "False information" },
    { id: "bullying", label: "Bullying or harassment" },
];

const mockNotifications = [
    { id: 1, title: 'Your order has shipped!', description: 'Your Vintage Camera is on its way.', time: '15m ago', read: false, href: '/orders' },
    { id: 2, title: 'Flash Sale Alert!', description: 'GadgetGuru is having a 50% off flash sale now!', time: '1h ago', read: false, href: '/seller/profile?userId=GadgetGuru' },
    { id: 3, title: 'New message from HomeHaven', description: '"Yes, the blue vases are back in stock!"', time: '4h ago', read: true, href: '/message' },
];

function LiveSellerSkeleton({key}: {key: React.Key}) {
    return (
        <div key={key} className="group relative rounded-lg overflow-hidden shadow-lg">
            <Skeleton className="w-full aspect-[2/3]" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeedPostSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                </div>
            </div>
            <div className="px-4 pb-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="w-full aspect-video rounded-lg" />
            </div>
        </Card>
    );
}

function CommentSheet({ postId, trigger }: { postId: string, trigger: React.ReactNode }) {
    const { user, userData } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const db = getFirestoreDb();
        const commentsQuery = query(collection(db, `posts/${postId}/comments`), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
            }));
            setComments(commentsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [postId]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !userData) return;
        
        const db = getFirestoreDb();
        await addDoc(collection(db, `posts/${postId}/comments`), {
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL,
            text: newComment.trim(),
            timestamp: serverTimestamp(),
        });

        // Also increment the replies count on the post
        await updateDoc(doc(db, 'posts', postId), {
            replies: increment(1)
        });

        setNewComment("");
    };

    return (
         <Sheet>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Comments</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 px-4">
                    {isLoading ? (
                        <div className="space-y-4 py-4">
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-4 py-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.authorAvatar} />
                                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow bg-muted p-2 rounded-lg">
                                        <div className="flex justify-between items-center text-xs">
                                            <p className="font-semibold">{comment.authorName}</p>
                                            <p className="text-muted-foreground">{comment.timestamp}</p>
                                        </div>
                                        <p className="text-sm">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to reply!</p>
                    )}
                </ScrollArea>
                <DialogFooter className="p-4 border-t">
                    <form onSubmit={handlePostComment} className="w-full flex items-center gap-2">
                        <Input 
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button type="submit" disabled={!newComment.trim()}><Send className="w-4 h-4" /></Button>
                    </form>
                </DialogFooter>
            </SheetContent>
        </Sheet>
    )
}

export default function LiveSellingPage() {
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const { user, userData, loading: authLoading } = useAuth();
  const { signOut } = useAuthActions();
  const [feed, setFeed] = useState<any[]>([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [suggestedUsers, setSuggestedUsers] = useState<UserData[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const createPostFormRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allSellers, setAllSellers] = useState(liveSellers);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const [activeLiveFilter, setActiveLiveFilter] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [activeProductFilter, setActiveProductFilter] = useState('All');


  const liveStreamFilterButtons = useMemo(() => {
    const categories = new Set(allSellers.map(s => s.category));
    return ['All', ...Array.from(categories)];
  }, [allSellers]);

   const productFilterButtons = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty'];
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const loadData = () => {
        setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
        
        const liveStreamDataRaw = localStorage.getItem('liveStream');
        if (liveStreamDataRaw) {
            try {
                const liveStreamData = JSON.parse(liveStreamDataRaw);
                const newSellerCard = {
                    id: liveStreamData.seller.uid,
                    name: liveStreamData.seller.name,
                    avatarUrl: liveStreamData.seller.photoURL || 'https://placehold.co/40x40.png',
                    thumbnailUrl: liveStreamData.product?.image?.preview || 'https://placehold.co/300x450.png',
                    category: liveStreamData.product?.category || 'General',
                    viewers: Math.floor(Math.random() * 5000),
                    buyers: Math.floor(Math.random() * 100),
                    rating: 4.5,
                    reviews: Math.floor(Math.random() * 50),
                    hint: liveStreamData.product?.name?.toLowerCase() || 'live stream',
                    productId: liveStreamData.product?.id,
                    isMyStream: true,
                };
                setAllSellers(currentSellers => {
                    const existingSellers = currentSellers.filter(s => s.id !== newSellerCard.id);
                    return [newSellerCard, ...existingSellers];
                });
            } catch (error) {
                console.error("Error parsing live stream data from localStorage", error);
            }
        } else {
            setAllSellers(currentSellers => currentSellers.filter(s => !s.isMyStream));
        }
      };

      loadData();
      
      const handleStorageChange = (event: StorageEvent) => {
          if (event.key === 'liveStream' || event.key === 'streamcart_cart' || event.key === null) {
              loadData();
          }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isMounted]);

  const trendingTopics = useMemo(() => {
    const hashtagCounts: { [key: string]: number } = {};
    feed.forEach(post => {
      const hashtags = post.content.match(/#\w+/g) || [];
      hashtags.forEach((tag: string) => {
        const cleanedTag = tag.substring(1);
        hashtagCounts[cleanedTag] = (hashtagCounts[cleanedTag] || 0) + 1;
      });
    });
    return Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, posts]) => ({ topic, posts: `${posts} post${posts > 1 ? 's' : ''}` }));
  }, [feed]);
  
  const popularProducts = useMemo(() => {
      let products = Object.values(productDetails);
      if (activeProductFilter !== 'All') {
          const lowerCaseFilter = activeProductFilter.toLowerCase();
          if (lowerCaseFilter === 'fashion') {
               products = products.filter(p => ['Women', 'Men', 'Handbags', 'Shoes'].includes(p.category));
          } else {
               products = products.filter(p => p.category.toLowerCase() === lowerCaseFilter);
          }
      }
      return products
          .sort((a,b) => (b.isAuctionItem ? 1 : 0) - (a.isAuctionItem ? 1 : 0))
          .slice(0, 40);
  }, [activeProductFilter]);

  const mostReachedPosts = useMemo(() => {
    return [...feed].sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies)).slice(0, 40);
  }, [feed]);

 useEffect(() => {
    if (!isMounted) return;

    const sellersTimer = setTimeout(() => setIsLoadingSellers(false), 1000);

    const db = getFirestoreDb();
    let postsQuery;

    if (activeTab === 'feeds') {
      setIsLoadingFeed(true);
      postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      
      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
        }));
        setFeed(postsData);
        setIsLoadingFeed(false);
      });
      
      return () => {
        clearTimeout(sellersTimer);
        unsubscribe();
      };
    } else {
      postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
       const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
        }));
        setFeed(postsData);
      });
      setIsLoadingFeed(false);
      return () => {
        clearTimeout(sellersTimer);
        unsubscribe();
      }
    }
  }, [isMounted, activeTab, user, followingIds]);
  
  const handleFollowToggle = async (targetId: string) => {
    if (!user) {
        handleAuthAction();
        return;
    }
    await toggleFollow(user.uid, targetId);
    setFollowingIds(prev =>
      prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]
    );
  };
  
   useEffect(() => {
    const checkFollowing = async () => {
        if (!user) return;
        const promises = suggestedUsers.map(u => isFollowing(user.uid, u.uid));
        const results = await Promise.all(promises);
        const following = suggestedUsers.filter((u, index) => results[index]);
        setFollowingIds(following.map(u => u.uid));
    };

    if (suggestedUsers.length > 0) {
        checkFollowing();
    }
  }, [user, suggestedUsers]);

  const handleAuthAction = (cb?: () => void) => {
    if (!user) {
        setIsAuthDialogOpen(true);
        return false;
    }
    if (cb) cb();
    return true;
  };

  const topLiveStreams = useMemo(() => {
    let sellers = [...allSellers];
     if (searchTerm) {
        sellers = sellers.filter(seller => 
            seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return sellers.sort((a, b) => b.viewers - a.viewers).slice(0, 8);
  }, [allSellers, searchTerm]);

  const filteredLiveSellers = useMemo(() => {
    let sellers = [...allSellers];

    if (activeLiveFilter !== 'All') {
        sellers = sellers.filter(seller => seller.category === activeLiveFilter);
    }
    
    if (searchTerm) {
        sellers = sellers.filter(seller => 
            seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return sellers;
  }, [searchTerm, allSellers, activeLiveFilter]);

  const filteredFeed = useMemo(() => {
    if (!searchTerm) return feed;
    return feed.filter(item => 
        item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, feed]);

  

  const handleReply = (sellerName: string) => {
    handleAuthAction(() => {
      setReplyTo(sellerName);
      if (createPostFormRef.current) {
        createPostFormRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const handleShare = (postId: number) => {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link);
    toast({
        title: "Link Copied!",
        description: "The post link has been copied to your clipboard.",
    });
  };

  const submitReport = () => {
    handleAuthAction(() => {
        console.log("Submitting report for reason:", selectedReportReason);
        toast({
            title: "Report Submitted",
            description: "Thank you for your feedback. We will review this post.",
        });
        setIsReportDialogOpen(false);
        setSelectedReportReason("");
    });
  };
  
  const handleLiveFilterSelect = (filter: string) => {
    setActiveLiveFilter(filter);
    setActiveTab('live');
  };
  
  const markAsRead = (id: number) => {
    setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDeletePost = async (postId: string, mediaUrl: string | null) => {
    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    
    try {
        await deleteDoc(postRef);

        if (mediaUrl) {
            const storage = getFirebaseStorage();
            const mediaRef = storageRef(storage, mediaUrl);
            await deleteObject(mediaRef);
        }

        toast({
            title: "Post Deleted",
            description: "Your post has been successfully removed.",
        });
    } catch (error) {
        console.error("Error deleting post: ", error);
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Could not delete the post. Please try again."
        });
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!handleAuthAction()) return;

    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, `posts/${postId}/likes`, user!.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                // User has already liked, so unlike
                transaction.delete(likeRef);
                transaction.update(postRef, { likes: increment(-1) });
            } else {
                // User has not liked, so like
                transaction.set(likeRef, { likedAt: serverTimestamp() });
                transaction.update(postRef, { likes: increment(1) });
            }
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update like status. Please try again."
        });
    }
};

  const getCategoryUrl = (categoryName: string) => `/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                    <AlertDialogDescription>
                        You need to be logged in to perform this action. Please log in or create an account to continue.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => router.push('/signup')}>Create Account</AlertDialogAction>
                    <AlertDialogAction onClick={() => router.push('/')}>Login</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
             <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center gap-1 sm:gap-2">
                         <Link href="/live-selling" className="flex items-center gap-2">
                             <Logo className="h-7 w-7" />
                             <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                         </Link>
                    </div>

                    <div className="hidden sm:flex flex-1 justify-center px-8">
                         <div className={cn(
                            "relative w-full max-w-sm lg:max-w-md transition-all duration-300",
                            isSearchOpen ? "w-full" : "w-auto"
                         )}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground peer-focus:text-foreground"/>
                                <Input 
                                    placeholder="Search..." 
                                    className="rounded-full bg-muted h-10 pl-10 peer transition-all duration-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchOpen(true)}
                                    onBlur={() => setIsSearchOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsSearchOpen(prev => !prev)}>
                            <Search className="h-5 w-5"/>
                        </Button>

                         <Link href="/listed-products" passHref>
                            <Button variant="ghost" size="icon">
                                <ShoppingBag className="h-5 w-5"/>
                            </Button>
                        </Link>
                        
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {notifications.map(n => (
                                    <Link key={n.id} href={n.href} passHref>
                                        <DropdownMenuItem className={cn("flex-col items-start gap-1", !n.read && "bg-primary/5")} onSelect={() => markAsRead(n.id)}>
                                            <div className="flex justify-between w-full">
                                                <p className={cn("font-semibold", !n.read && "text-primary")}>{n.title}</p>
                                                <p className="text-xs text-muted-foreground">{n.time}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{n.description}</p>
                                        </DropdownMenuItem>
                                    </Link>
                                ))}
                                {notifications.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'}/>
                                        <AvatarFallback>{isMounted && user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User/>}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            {user && userData ? (
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuLabel>
                                        <div>{userData?.displayName}</div>
                                        <div className="text-xs text-muted-foreground font-normal">{userData?.email}</div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                     {userData?.role === 'admin' && (
                                        <DropdownMenuItem onSelect={() => router.push('/admin/dashboard')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Admin Dashboard</span>
                                        </DropdownMenuItem>
                                    )}
                                    {(userData?.role === 'seller') && (
                                        <DropdownMenuItem onSelect={() => router.push('/seller/dashboard')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Seller Dashboard</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onSelect={() => router.push('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>My Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/feed')}>
                                        <Tv className="mr-2 h-4 w-4" />
                                        <span>My Feed</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/orders')}>
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>My Orders</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/wishlist')}>
                                        <Heart className="mr-2 h-4 w-4" />
                                        <span>My Wishlist</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/cart')}>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span>My Cart</span>
                                         {cartCount > 0 && <Badge variant="destructive" className="ml-auto">{cartCount}</Badge>}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/wallet')}>
                                        <Wallet className="mr-2 h-4 w-4" />
                                        <span>My Wallet</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     <DropdownMenuItem onSelect={() => router.push('/setting')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/help')}>
                                        <LifeBuoy className="mr-2 h-4 w-4" />
                                        <span>Help &amp; Support</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/privacy-and-security')}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Privacy &amp; Security</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                                            <span>Theme</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut(userData?.role === 'seller')}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            ) : (
                                 <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => router.push('/')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Login or Sign Up</span>
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                        
                        {(userData?.role === 'seller' || userData?.role === 'admin') && (
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="hidden lg:flex">
                                        <RadioTower className="mr-2 h-4 w-4"/> Go Live
                                    </Button>
                                </DialogTrigger>
                                <GoLiveDialog />
                            </Dialog>
                        )}
                    </div>
                </div>
                 {isSearchOpen && (
                    <div className="absolute top-16 left-0 w-full p-4 bg-background border-b sm:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search..." 
                                className="rounded-full bg-muted h-10 pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                 )}
            </header>
            
            <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                    <TabsList className="bg-transparent p-0 h-auto">
                        <TabsTrigger value="all" className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">All</TabsTrigger>
                        <TabsTrigger value="live" className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">Live</TabsTrigger>
                    </TabsList>
                </div>
            </div>

            <div className="flex-grow">
                {isSearchOpen ? (
                    <ProductSearchWithStreams />
                ) : (
                <TabsContent value="all" className="mt-0">
                    <div className="space-y-8 mt-0">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <PromotionalCarousel />
                        </div>
                        <section>
                            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><Flame className="text-primary" /> Top Live Streams</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-4 px-2 md:px-4">
                                {topLiveStreams.map((seller: any) => (
                                     <Link href={`/stream/${seller.id}`} key={seller.id} className="group">
                                        <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                                            <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                            <div className="absolute top-2 right-2 z-10">
                                                <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm gap-1.5">
                                                    <Users className="h-3 w-3"/>
                                                    {seller.viewers}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 mt-2">
                                            <Avatar className="w-7 h-7">
                                                <AvatarImage src={seller.avatarUrl} />
                                                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold text-xs group-hover:underline truncate">{seller.name}</p>
                                                <p className="text-xs text-muted-foreground">{seller.category}</p>
                                                <p className="text-xs text-primary font-semibold mt-0.5">#{seller.category.toLowerCase()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                        
                        <section className="mt-8">
                             <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><Sparkles className="text-primary" /> Popular Products</h2>
                            </div>
                             <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-wrap justify-center gap-2">
                                {productFilterButtons.map((filter) => (
                                <Button 
                                    key={filter} 
                                    variant={activeProductFilter === filter ? 'default' : 'outline'} 
                                    size="sm" 
                                    className="rounded-full text-xs md:text-sm h-8 md:h-9"
                                    onClick={() => setActiveProductFilter(filter)}
                                >
                                    {filter}
                                </Button>
                                ))}
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs md:text-sm h-8 md:h-9"
                                >
                                    <Link href="/listed-products">
                                        More
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 px-2 md:px-4">
                                {popularProducts.map((product: any) => (
                                     <Link href={`/product/${product.key}`} key={product.id} className="group block">
                                        <Card className="w-full overflow-hidden h-full flex flex-col bg-card">
                                            <div className="relative aspect-square bg-muted">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                    data-ai-hint={product.hint}
                                                />
                                            </div>
                                            <div className="p-3 flex-grow flex flex-col">
                                                <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                                <p className="font-bold text-foreground mt-1">{product.price}</p>
                                                <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span>4.8</span>
                                                    <span className="text-muted-foreground">({product.reviews || '1.2k'})</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                    <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {product.stock} left</div>
                                                    <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {product.sold} sold</div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                        
                        <section className="mt-8">
                             <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><TrendingUp className="text-primary" /> Most Reached Posts</h2>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 auto-rows-fr gap-4 px-4 sm:px-6 lg:px-8">
                                {mostReachedPosts.map(post => (
                                     <Card key={post.id} className="overflow-hidden flex flex-col bg-card">
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={post.avatarUrl} alt={post.sellerName} />
                                                        <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-primary">{post.sellerName}</p>
                                                        <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mr-2 -mt-2">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => handleShare(post.id)}>
                                                            <Share2 className="mr-2 h-4 w-4" />
                                                            <span>Share</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={submitReport}>
                                                            <Flag className="mr-2 h-4 w-4" />
                                                            <span>Report</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <p className="text-sm line-clamp-2">{post.content}</p>
                                        </div>
                                        <div className="mt-auto px-4 pb-3 flex justify-between items-center text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1.5 hover:text-primary">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 hover:text-primary">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>{post.replies || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>
                </TabsContent>
                )}

                <TabsContent value="live" className="mt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {liveStreamFilterButtons.map((filter) => (
                                <Button 
                                    key={filter} 
                                    variant={activeLiveFilter === filter ? 'default' : 'outline'} 
                                    size="sm" 
                                    className="bg-card/50 rounded-full text-xs md:text-sm h-8 md:h-9"
                                    onClick={() => setActiveLiveFilter(filter)}
                                >
                                    {filter}
                                </Button>
                                ))}
                                <Button variant="ghost" size="sm" className="bg-card/50 rounded-full text-xs md:text-sm h-8 md:h-9">
                                    Filters
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            {isLoadingSellers ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                        <LiveSellerSkeleton key={index} />
                                    ))}
                                </div>
                            ) : filteredLiveSellers.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {filteredLiveSellers.map((seller: any) => (
                                        <Link href={`/stream/${seller.id}`} key={seller.id} className="group">
                                            <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                                                <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                                <div className="absolute top-2 right-2 z-10">
                                                    <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm gap-1.5">
                                                        <Users className="h-3 w-3"/>
                                                        {seller.viewers}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 mt-2">
                                                <Avatar className="w-7 h-7">
                                                    <AvatarImage src={seller.avatarUrl} />
                                                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-xs group-hover:underline truncate">{seller.name}</p>
                                                    <p className="text-xs text-muted-foreground">{seller.category}</p>
                                                    <p className="text-xs text-primary font-semibold mt-0.5">#{seller.category.toLowerCase()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-lg font-semibold">No results found</p>
                                    <p>Try searching for something else or changing the filter.</p>
                                </div>
                            )}
                    </div>
                    </TabsContent>
            </div>
        </Tabs>
        <div className="mt-12">
          <Footer />
        </div>
      </div>
    </>
  );
}
