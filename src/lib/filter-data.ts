
export interface FilterOptions {
    subCategories: string[];
    brands: string[];
    sizes: string[];
    colors: { name: string; value: string }[];
}

const defaultOptions: FilterOptions = {
    subCategories: [],
    brands: [],
    sizes: [],
    colors: [],
};

const filterData: { [key: string]: Partial<FilterOptions> } = {
    "women": {
        subCategories: ["Dresses", "Tops", "Jeans", "Jackets", "Skirts"],
        brands: ["Brand A", "Brand B", "Brand C"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: [
            { name: "Black", value: "bg-black" },
            { name: "White", value: "bg-white" },
            { name: "Blue", value: "bg-blue-500" },
            { name: "Red", value: "bg-red-500" },
            { name: "Green", value: "bg-green-500" },
        ],
    },
    "electronics": {
        subCategories: ["Smartphones", "Laptops", "Headphones", "Cameras"],
        brands: ["Apple", "Samsung", "Sony", "Dell", "RetroCam"],
        sizes: [], // No sizes for electronics
        colors: [
            { name: "Black", value: "bg-black" },
            { name: "White", value: "bg-white" },
            { name: "Silver", value: "bg-slate-300" },
            { name: "Space Gray", value: "bg-gray-600" },
        ],
    },
    "home": {
        subCategories: ["Bedding", "Furniture", "Lighting", "Decor"],
        brands: ["HomeCreations", "CozyLiving", "ModernHome"],
        sizes: [], // Sizes might apply to bedding, but we'll keep it simple
        colors: [
            { name: "Beige", value: "bg-amber-100" },
            { name: "Gray", value: "bg-gray-400" },
            { name: "Navy", value: "bg-blue-900" },
        ],
    },
    "default": {
        subCategories: ["General", "Miscellaneous"],
        brands: ["Brand A", "Brand B", "Brand C", "RetroCam"],
        sizes: [],
        colors: [],
    }
};

export function getFilterOptionsForCategory(category: string): FilterOptions {
    const lowerCategory = category.toLowerCase();
    const options = filterData[lowerCategory] || filterData.default;

    return {
        ...defaultOptions,
        ...options,
    };
}
