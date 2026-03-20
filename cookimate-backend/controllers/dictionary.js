// dictionary.js - Comprehensive Culinary Allowlist
// Contains over 2000+ cooking-related words organized by category

// Helper function to combine all word lists
const createAllowlist = () => {
  const allWords = new Set();
  
  // Flatten and add all categories
  const allCategories = [
    ...cookingActions,
    ...ingredients.produce,
    ...ingredients.meat,
    ...ingredients.seafood,
    ...ingredients.dairy,
    ...ingredients.pantry,
    ...ingredients.herbsSpices,
    ...ingredients.grains,
    ...ingredients.baking,
    ...ingredients.condiments,
    ...kitchenTools,
    ...cookingMethods,
    ...flavorsTextures,
    ...measurements,
    ...mealTypes,
    ...cuisines,
    ...mealTimes,
    ...descriptors,
    ...dietaryTerms,
    ...preparationTerms,
    ...techniques,
    ...foodAdjectives,
    ...resultDescriptors,
    ...temperatureTerms,
    ...quantityTerms,
    ...timeTerms,
    ...utensils,
    ...appliances,
    ...drinkTerms,
    ...occasionTerms,
    ...ethnicIngredients,
    ...cookingStyles,
    ...nutritionTerms,
    ...foodScience,
    ...beverages,
    ...commonPhrases,
    ...pantryItems,
    ...fruits,
    ...vegetables,
    ...nutsSeeds,
    ...mushrooms,
    ...internationalIngredients,
    ...cannedGoods,
    ...frozenFoods,
    ...deliItems,
    ...bakeryItems,
    ...specialtyFoods
  ];
  
  allCategories.forEach(word => allWords.add(word.toLowerCase()));
  
  return allWords;
};

// ==================== COOKING ACTIONS & VERBS ====================
const cookingActions = [
  // Basic preparation
  "wash", "rinse", "clean", "peel", "pare", "trim", "core", "seed", "pit",
  "chop", "dice", "mince", "cube", "julienne", "shred", "grate", "slice",
  "cut", "carve", "fillet", "score", "butterfly", "spatchcock", "debone",
  
  // Mixing & combining
  "mix", "stir", "whisk", "beat", "whip", "cream", "fold", "blend",
  "combine", "incorporate", "knead", "work", "rub", "marry",
  
  // Cooking methods
  "cook", "prepare", "make", "bake", "roast", "grill", "broil", "fry",
  "saute", "panfry", "deepfry", "stirfry", "steam", "boil", "simmer",
  "poach", "braise", "stew", "sear", "brown", "caramelize", "char",
  "smoke", "cure", "pickle", "ferment", "preserve", "can", "dehydrate",
  "freeze", "chill", "refrigerate", "thaw", "defrost", "temper",
  
  // Heat applications
  "preheat", "heat", "warm", "cool", "melt", "soften", "harden", "set",
  "reduce", "thicken", "thin", "dilute", "temper", "blanch", "shock",
  
  // Finishing techniques
  "season", "salt", "pepper", "spice", "flavor", "marinate", "brine",
  "coat", "dredge", "bread", "batter", "dip", "roll", "sprinkle",
  "dust", "garnish", "decorate", "drizzle", "spread", "brush", "glaze",
  "ice", "frost", "pipe", "fill", "stuff", "wrap", "bundle", "tie",
  
  // Serving & plating
  "plate", "serve", "present", "garnish", "portion", "dish", "ladle",
  "scoop", "spoon", "pour", "dress", "toss", "arrange", "layer",
  
  // Testing & checking
  "taste", "sample", "check", "test", "adjust", "correct", "balance",
  "season", "salt", "pepper", "spice", "correct"
];

// ==================== INGREDIENTS ====================
const ingredients = {
  produce: [
    // Fruits - Common
    "apple", "apricot", "avocado", "banana", "blackberry", "blueberry",
    "cherry", "coconut", "cranberry", "date", "fig", "grape", "grapefruit",
    "kiwi", "lemon", "lime", "mango", "melon", "nectarine", "orange",
    "papaya", "peach", "pear", "pineapple", "plum", "pomegranate", "raspberry",
    "strawberry", "tangerine", "watermelon",
    
    // Exotic fruits
    "acerola", "ackee", "ambarella", "buddha hand", "cactus pear", "canistel",
    "carambola", "cempedak", "cherimoya", "currant", "durian", "elderberry",
    "feijoa", "gooseberry", "guanabana", "guava", "honeydew", "huckleberry",
    "jackfruit", "jabuticaba", "jujube", "kumquat", "longan", "loquat",
    "lychee", "mangosteen", "mulberry", "nance", "olive", "passionfruit",
    "persimmon", "physalis", "pomelo", "prickly pear", "quince", "rambutan",
    "rhubarb", "salak", "sapodilla", "soursop", "sugar apple", "tamarillo",
    "tamarind", "ugli fruit", "yuzu",
    
    // Vegetables - Common
    "artichoke", "arugula", "asparagus", "bean", "beet", "bell pepper",
    "bok choy", "broccoli", "brussels sprout", "cabbage", "carrot",
    "cauliflower", "celery", "chard", "collard greens", "corn", "cucumber",
    "eggplant", "endive", "fennel", "garlic", "ginger", "green bean",
    "horseradish", "kale", "leek", "lettuce", "mushroom", "okra", "onion",
    "parsnip", "pea", "potato", "pumpkin", "radish", "rhubarb", "shallot",
    "spinach", "squash", "sweet potato", "taro", "tomato", "turnip",
    "watercress", "yam", "zucchini",
    
    // Exotic vegetables
    "bitter melon", "breadfruit", "cassava", "chayote", "daikon",
    "jicama", "kohlrabi", "malanga", "manioc", "nopales", "plantain",
    "salsify", "tomatillo", "yucca", "galangal", "kaffir lime", "lemongrass",
    "lotus root", "water chestnut"
  ],
  
  meat: [
    // Beef
    "beef", "steak", "ribeye", "sirloin", "tenderloin", "filet mignon",
    "flank steak", "skirt steak", "chuck roast", "brisket", "short rib",
    "ground beef", "hamburger", "meatball", "beef tongue", "oxtail",
    
    // Pork
    "pork", "bacon", "ham", "prosciutto", "pancetta", "guanciale",
    "pork chop", "pork loin", "pork shoulder", "pork belly", "pork butt",
    "sausage", "chorizo", "andouille", "bratwurst", "salami", "pepperoni",
    
    // Poultry
    "chicken", "turkey", "duck", "goose", "quail", "pheasant", "squab",
    "cornish hen", "chicken breast", "chicken thigh", "chicken wing",
    "chicken leg", "drumstick", "turkey breast", "duck breast", "foie gras",
    
    // Lamb & Game
    "lamb", "mutton", "lamb chop", "leg of lamb", "rack of lamb",
    "venison", "bison", "buffalo", "elk", "rabbit", "hare", "squirrel",
    "boar", "goat", "kangaroo", "ostrich", "emu",
    
    // Variety meats
    "liver", "kidney", "heart", "tripe", "sweetbread", "brain", "tongue",
    "gizzard", "offal", "chitterlings"
  ],
  
  seafood: [
    // Fish
    "fish", "salmon", "tuna", "cod", "haddock", "halibut", "tilapia",
    "catfish", "bass", "trout", "mackerel", "sardine", "anchovy", "herring",
    "snapper", "grouper", "flounder", "sole", "swordfish", "mahi mahi",
    "sea bass", "barramundi", "pollock", "perch", "walleye", "carp",
    "eel", "monkfish", "orange roughy", "rainbow trout", "rockfish",
    
    // Shellfish
    "shrimp", "prawn", "crab", "lobster", "crayfish", "crawfish",
    "clam", "mussel", "oyster", "scallop", "abalone", "conch",
    "whelk", "cockle", "geoduck",
    
    // Cephalopods
    "squid", "calamari", "octopus", "cuttlefish",
    
    // Roe & Specialty
    "caviar", "roe", "ikura", "tobiko", "masago", "uni", "sea urchin",
    
    // Preserved seafood
    "salted fish", "dried fish", "smoked salmon", "lox", "bottarga",
    "fish sauce", "oyster sauce", "anchovy paste"
  ],
  
  dairy: [
    "milk", "cream", "butter", "yogurt", "cheese", "sour cream",
    "cream cheese", "cottage cheese", "ricotta", "mozzarella", "parmesan",
    "cheddar", "swiss cheese", "provolone", "gouda", "edam", "brie",
    "camembert", "blue cheese", "gorgonzola", "feta", "goat cheese",
    "pecorino", "asiago", "manchego", "gruyere", "emmental", "monterey jack",
    "pepper jack", "colby", "havarti", "muenster", "queso fresco",
    "paneer", "halloumi", "buttermilk", "condensed milk", "evaporated milk",
    "whipped cream", "clotted cream", "creme fraiche", "mascarpone",
    "skim milk", "whole milk", "half and half", "ice cream", "gelato",
    "frozen yogurt", "kefir", "lassi", "ayran", "labneh", "eggs"
  ],
  
  pantry: [
    // Oils & Fats
    "oil", "olive oil", "vegetable oil", "canola oil", "sunflower oil",
    "peanut oil", "sesame oil", "coconut oil", "avocado oil", "grapeseed oil",
    "corn oil", "soybean oil", "palm oil", "shortening", "lard", "tallow",
    "schmaltz", "duck fat", "ghee", "margarine",
    
    // Vinegars
    "vinegar", "white vinegar", "apple cider vinegar", "red wine vinegar",
    "white wine vinegar", "balsamic vinegar", "rice vinegar", "sherry vinegar",
    "champagne vinegar", "coconut vinegar", "cane vinegar", "malt vinegar",
    
    // Sauces & Condiments
    "soy sauce", "teriyaki sauce", "hoisin sauce", "oyster sauce",
    "fish sauce", "worcestershire sauce", "hot sauce", "sriracha",
    "tabasco", "chili sauce", "sweet chili sauce", "bbq sauce",
    "ketchup", "mustard", "mayonnaise", "relish", "pickles",
    "salsa", "pico de gallo", "guacamole", "hummus", "tahini",
    "pesto", "chimichurri", "romesco", "aioli", "remoulade",
    "tartar sauce", "cocktail sauce", "horseradish sauce",
    
    // Broths & Bases
    "broth", "stock", "bouillon", "consomme", "bone broth", "chicken stock",
    "beef stock", "vegetable stock", "fish stock", "dashi", "miso",
    
    // Canned/Preserved
    "canned tomato", "tomato paste", "tomato sauce", "tomato puree",
    "crushed tomato", "diced tomato", "beans", "canned beans",
    "chickpeas", "lentils", "canned corn", "canned peas", "canned mushroom",
    "canned fruit", "canned fish", "canned tuna", "canned salmon",
    "canned sardines", "canned crab", "canned ham", "spam"
  ],
  
  herbsSpices: [
    // Herbs - Fresh & Dried
    "basil", "oregano", "thyme", "rosemary", "sage", "parsley",
    "cilantro", "coriander", "dill", "mint", "spearmint", "peppermint",
    "chives", "tarragon", "marjoram", "bay leaf", "chervil", "savory",
    "lavender", "lemongrass", "kaffir lime leaf", "curry leaf", "fenugreek leaf",
    
    // Spices - Whole & Ground
    "salt", "pepper", "black pepper", "white pepper", "pink pepper",
    "chili powder", "cayenne", "paprika", "smoked paprika", "turmeric",
    "cumin", "coriander seed", "fennel seed", "caraway seed", "celery seed",
    "mustard seed", "mustard powder", "ginger", "cinnamon", "nutmeg",
    "clove", "allspice", "cardamom", "star anise", "anise seed",
    "vanilla", "vanilla bean", "vanilla extract", "saffron", "mace",
    "fenugreek", "asafoetida", "sumac", "zaatar", "ras el hanout",
    "garam masala", "curry powder", "five spice", "chinese five spice",
    "berbere", "harissa", "baharat", "adobo", "cajun seasoning",
    "old bay", "pumpkin pie spice", "apple pie spice",
    
    // Spice blends
    "italian seasoning", "herbes de provence", "fines herbes",
    "poultry seasoning", "steak seasoning", "seasoned salt",
    "garlic salt", "onion salt", "celery salt", "garlic powder",
    "onion powder", "chili flakes", "red pepper flakes", "crushed red pepper"
  ],
  
  grains: [
    // Rice
    "rice", "white rice", "brown rice", "basmati rice", "jasmine rice",
    "arborio rice", "sushi rice", "glutinous rice", "sticky rice",
    "wild rice", "black rice", "red rice", "parboiled rice", "converted rice",
    
    // Other grains
    "wheat", "barley", "oats", "oatmeal", "rolled oats", "steel cut oats",
    "quinoa", "buckwheat", "millet", "spelt", "farro", "freekeh",
    "bulgur", "couscous", "israeli couscous", "polenta", "grits",
    "cornmeal", "corn flour", "masa harina", "semolina", "durum wheat",
    
    // Pasta & Noodles
    "pasta", "spaghetti", "linguine", "fettuccine", "tagliatelle",
    "lasagna", "ravioli", "tortellini", "gnocchi", "macaroni",
    "penne", "rigatoni", "ziti", "farfalle", "rotini", "fusilli",
    "orzo", "angel hair", "vermicelli", "ramen", "udon", "soba",
    "somen", "rice noodles", "glass noodles", "cellophane noodles",
    "egg noodles", "chow mein noodles", "lo mein noodles"
  ],
  
  baking: [
    // Flours
    "flour", "all purpose flour", "bread flour", "cake flour",
    "pastry flour", "whole wheat flour", "white whole wheat flour",
    "rye flour", "buckwheat flour", "oat flour", "spelt flour",
    "almond flour", "coconut flour", "rice flour", "gluten free flour",
    "self rising flour", "00 flour", "semolina flour", "durum flour",
    
    // Leaveners
    "yeast", "active dry yeast", "instant yeast", "rapid rise yeast",
    "baking powder", "baking soda", "sourdough starter", "levain",
    
    // Sweeteners
    "sugar", "granulated sugar", "white sugar", "brown sugar",
    "powdered sugar", "confectioners sugar", "caster sugar", "superfine sugar",
    "turbinado sugar", "demerara sugar", "muscovado sugar", "coconut sugar",
    "honey", "maple syrup", "corn syrup", "agave nectar", "molasses",
    "brown rice syrup", "date syrup", "stevia", "splenda", "artificial sweetener",
    
    // Chocolate
    "chocolate", "dark chocolate", "milk chocolate", "white chocolate",
    "bittersweet chocolate", "semisweet chocolate", "unsweetened chocolate",
    "cocoa powder", "dutch processed cocoa", "cacao nibs", "chocolate chips",
    "chocolate bar", "couverture chocolate", "ganache",
    
    // Baking additives
    "vanilla extract", "almond extract", "peppermint extract", "lemon extract",
    "food coloring", "sprinkles", "jimmies", "nonpareils", "sanding sugar",
    "pearl sugar", "cinnamon sugar", "baking chocolate", "bittersweet",
    "semisweet", "unsweetened", "cocoa butter", "shortening"
  ],
  
  condiments: [
    "ketchup", "mustard", "mayonnaise", "relish", "pickle relish",
    "bbq sauce", "hot sauce", "sriracha", "tabasco", "cholula",
    "worcestershire sauce", "soy sauce", "teriyaki sauce", "hoisin sauce",
    "oyster sauce", "fish sauce", "salsa", "pico de gallo", "guacamole",
    "hummus", "tahini", "pesto", "chimichurri", "romesco", "aioli",
    "remoulade", "tartar sauce", "cocktail sauce", "horseradish",
    "mint sauce", "apple sauce", "cranberry sauce", "gravy",
    "mushroom sauce", "cheese sauce", "alfredo sauce", "marinara",
    "pizza sauce", "pasta sauce", "enchilada sauce", "mole",
    "curry sauce", "satay sauce", "peanut sauce", "sweet and sour sauce",
    "plum sauce", "duck sauce", "mustard sauce", "honey mustard",
    "ranch dressing", "blue cheese dressing", "caesar dressing",
    "italian dressing", "greek dressing", "vinaigrette", "balsamic glaze"
  ]
};

// ==================== KITCHEN TOOLS & EQUIPMENT ====================
const kitchenTools = [
  // Knives & Cutting
  "knife", "chef knife", "paring knife", "serrated knife", "bread knife",
  "utility knife", "boning knife", "filet knife", "cleaver", "mezzaluna",
  "peeler", "vegetable peeler", "mandoline", "grater", "box grater",
  "microplane", "zester", "kitchen shears", "scissors", "cutting board",
  
  // Pots & Pans
  "pot", "pan", "skillet", "frying pan", "saute pan", "saucepan",
  "stockpot", "dutch oven", "casserole dish", "baking dish", "roasting pan",
  "sheet pan", "baking sheet", "cookie sheet", "muffin tin", "cupcake pan",
  "loaf pan", "cake pan", "springform pan", "bundt pan", "tart pan",
  "quiche dish", "pie plate", "ramekin", "souffle dish", "wok",
  "griddle", "grill pan", "cast iron skillet", "nonstick pan",
  
  // Mixing & Prep
  "bowl", "mixing bowl", "measuring cup", "measuring spoon", "scale",
  "kitchen scale", "colander", "strainer", "sieve", "mesh strainer",
  "whisk", "spatula", "rubber spatula", "wooden spoon", "slotted spoon",
  "ladle", "tongs", "rolling pin", "pastry brush", "dough scraper",
  "bench scraper", "pastry cutter", "pastry blender", "pie weights",
  
  // Appliances
  "oven", "stove", "stovetop", "range", "microwave", "toaster",
  "toaster oven", "blender", "immersion blender", "food processor",
  "stand mixer", "hand mixer", "slow cooker", "crockpot", "instant pot",
  "pressure cooker", "rice cooker", "air fryer", "deep fryer",
  "griddle", "panini press", "waffle iron", "ice cream maker",
  "bread machine", "dehydrator", "smoker", "sous vide", "vacuum sealer",
  "espresso machine", "coffee maker", "kettle", "electric kettle",
  
  // Bakeware
  "mixing bowl", "pastry board", "proofing basket", "banneton",
  "lame", "dough knife", "pastry wheel", "pastry bag", "piping bag",
  "piping tip", "decorating tip", "offset spatula", "cake stand",
  "cooling rack", "wire rack", "baking stone", "pizza stone",
  "pizza peel", "bread lame", "brotform",
  
  // Specialty Tools
  "spice grinder", "coffee grinder", "mortar and pestle", "molcajete",
  "garlic press", "citrus juicer", "lemon squeezer", "nutcracker",
  "nutmeg grater", "cheese grater", "cheese knife", "cheese board",
  "corkscrew", "bottle opener", "can opener", "jar opener",
  "melon baller", "ice cream scoop", "cookie scoop", "cookie press",
  "cookie cutter", "pizza cutter", "pastry wheel", "ravioli cutter",
  "egg slicer", "apple corer", "pineapple corer", "avocado slicer",
  
  // Thermometers & Timers
  "thermometer", "meat thermometer", "instant read thermometer",
  "candy thermometer", "oven thermometer", "refrigerator thermometer",
  "timer", "kitchen timer", "egg timer",
  
  // Storage
  "container", "food storage", "tupperware", "glass container",
  "mason jar", "canning jar", "spice jar", "spice rack",
  "canister", "flour container", "sugar container", "cookie jar",
  "bread box", "wine rack", "bottle rack", "refrigerator",
  "freezer", "pantry"
];

// ==================== COOKING METHODS ====================
const cookingMethods = [
  "bake", "roast", "grill", "broil", "fry", "pan fry", "deep fry",
  "shallow fry", "stir fry", "saute", "sear", "brown", "char", "blacken",
  "steam", "boil", "simmer", "poach", "parboil", "blanch", "shock",
  "braise", "stew", "pot roast", "confit", "sous vide", "smoke",
  "cure", "pickle", "ferment", "can", "preserve", "dehydrate",
  "freeze", "chill", "ice", "cool", "temper", "melt", "soften",
  "harden", "set", "reduce", "thicken", "thin", "dilute",
  "caramelize", "glaze", "crisp", "toast", "roast", "barbecue",
  "rotisserie", "spit roast", "plancha", "griddle", "flat top",
  "tandoor", "clay oven", "wood fired", "coal fired", "gas grill",
  "charcoal grill", "pellet grill", "electric grill", "induction",
  "microwave", "convection", "conventional", "combi steam"
];

// ==================== FLAVORS & TEXTURES ====================
const flavorsTextures = [
  // Basic tastes
  "sweet", "sour", "salty", "bitter", "savory", "umami", "tangy",
  "tart", "zesty", "spicy", "hot", "mild", "bland", "seasoned",
  
  // Flavor profiles
  "fruity", "citrusy", "berry", "apple", "tropical", "earthy",
  "nutty", "woody", "smoky", "charred", "toasty", "roasted",
  "herbal", "floral", "flowery", "perfumed", "aromatic", "pungent",
  "sharp", "biting", "acrid", "astringent", "metallic", "coppery",
  
  // Texture descriptors
  "crispy", "crunchy", "crusty", "flaky", "tender", "tough",
  "chewy", "rubbery", "gummy", "sticky", "gooey", "oozy",
  "creamy", "smooth", "silky", "velvety", "rich", "buttery",
  "greasy", "oily", "fatty", "lean", "dry", "moist", "juicy",
  "succulent", "watery", "runny", "thick", "thin", "watery",
  "dense", "light", "airy", "fluffy", "spongy", "cakey", "bready",
  "doughy", "pasty", "grainy", "gritty", "chunky", "lumpy",
  "smooth", "creamy", "velvety", "silky", "satiny",
  
  // Temperature related
  "hot", "warm", "room temperature", "cool", "cold", "chilled",
  "icy", "frozen", "melting", "molten", "scalding", "boiling",
  "simmering", "steaming", "smoking", "sizzling"
];

// ==================== MEASUREMENTS ====================
const measurements = [
  // Volume
  "teaspoon", "tsp", "tablespoon", "tbsp", "cup", "cups", "pint",
  "quart", "gallon", "milliliter", "ml", "liter", "l", "deciliter",
  "dl", "fluid ounce", "fl oz", "shot", "jigger", "dash", "pinch",
  "drop", "splash", "drizzle", "dollop", "smidgen",
  
  // Weight
  "ounce", "oz", "pound", "lb", "gram", "g", "kilogram", "kg",
  "milligram", "mg", "stone", "ton", "metric ton",
  
  // Length/Dimension
  "inch", "cm", "millimeter", "mm", "thick", "thin", "slice",
  "piece", "chunk", "wedge", "spear", "stick", "strip",
  
  // Count
  "each", "whole", "half", "quarter", "third", "dozen", "pair",
  "bunch", "bundle", "clove", "head", "bulb", "stalk", "sprig",
  "leaf", "leaves", "handful", "pinch", "dash", "touch",
  
  // Size descriptors
  "small", "medium", "large", "extra large", "jumbo", "mini",
  "bite size", "bite sized", "chunked", "diced", "minced",
  "chopped", "sliced", "julienned", "shredded", "grated"
];

// ==================== MEAL TYPES ====================
const mealTypes = [
  "appetizer", "starter", "entree", "main course", "main dish",
  "side dish", "side", "accompaniment", "salad", "soup", "stew",
  "chowder", "bisque", "broth", "consomme", "dessert", "sweet",
  "breakfast", "brunch", "lunch", "dinner", "supper", "snack",
  "finger food", "hors d'oeuvre", "canape", "amuse bouche",
  "antipasto", "tapas", "meze", "dim sum", "buffet", "family style",
  "plated", "course", "multi course", "tasting menu", "prix fixe",
  "a la carte", "comfort food", "soul food", "fast food", "slow food",
  "street food", "gourmet", "haute cuisine", "nouvelle cuisine",
  "fusion", "molecular gastronomy", "farm to table"
];

// ==================== CUISINES ====================
const cuisines = [
  // European
  "italian", "french", "spanish", "portuguese", "greek", "british",
  "english", "scottish", "irish", "welsh", "german", "austrian",
  "swiss", "dutch", "belgian", "swedish", "norwegian", "danish",
  "finnish", "icelandic", "russian", "ukrainian", "polish",
  "czech", "slovak", "hungarian", "romanian", "bulgarian",
  "serbian", "croatian", "bosnian", "albanian", "macedonian",
  
  // Asian
  "chinese", "sichuan", "cantonese", "hunan", "japanese",
  "korean", "vietnamese", "thai", "laotian", "cambodian",
  "burmese", "malaysian", "singaporean", "indonesian", "filipino",
  "indian", "north indian", "south indian", "punjabi", "gujarati",
  "bengali", "tamil", "sri lankan", "pakistani", "nepali",
  "tibetan", "mongolian", "taiwanese", "hong kong",
  
  // Middle Eastern
  "middle eastern", "lebanese", "syrian", "jordanian", "iraqi",
  "iranian", "persian", "israeli", "palestinian", "turkish",
  "armenian", "georgian", "azerbaijani", "uzbek", "kazakh",
  "afghan", "kurdish", "yemeni", "omani", "emirati", "qatari",
  "kuwaiti", "bahraini", "saudi",
  
  // African
  "moroccan", "algerian", "tunisian", "libyan", "egyptian",
  "ethiopian", "eritrean", "somalian", "kenyan", "tanzanian",
  "ugandan", "rwandan", "nigerian", "ghanaian", "senegalese",
  "mali", "ivorian", "cameroonian", "congolese", "south african",
  
  // Americas
  "american", "southern", "cajun", "creole", "tex mex",
  "new england", "midwestern", "southwestern", "californian",
  "hawaiian", "alaskan", "canadian", "quebecois", "mexican",
  "caribbean", "cuban", "puerto rican", "dominican", "jamaican",
  "haitian", "bahamian", "trinidadian", "barbadian", "central american",
  "south american", "brazilian", "argentinian", "chilean", "peruvian",
  "colombian", "venezuelan", "ecuadorian", "bolivian", "paraguayan",
  "uruguayan", "costarican", "panamanian", "nicaraguan",
  
  // Fusion & Modern
  "fusion", "asian fusion", "latin fusion", "mediterranean",
  "pan asian", "pan latin", "pan european", "global", "international",
  "modernist", "molecular", "new american", "new asian", "european"
];

// ==================== MEAL TIMES ====================
const mealTimes = [
  "breakfast", "brunch", "elevenses", "lunch", "luncheon",
  "afternoon tea", "high tea", "dinner", "supper", "late night",
  "midnight snack", "snack", "coffee break", "tea time",
  "happy hour", "aperitif", "digestif", "morning", "afternoon",
  "evening", "night", "weekend", "weekday", "holiday",
  "christmas", "thanksgiving", "easter", "passover", "ramadan",
  "diwali", "hanukkah", "new years", "birthday", "anniversary",
  "celebration", "party", "picnic", "barbecue", "cookout",
  "potluck", "buffet", "feast", "banquet", "reception"
];

// ==================== DESCRIPTORS ====================
const descriptors = [
  "delicious", "tasty", "flavorful", "savory", "sweet", "spicy",
  "mild", "hot", "cold", "warm", "fresh", "frozen", "canned",
  "dried", "freshly", "homemade", "store bought", "organic",
  "local", "imported", "artisanal", "handmade", "craft",
  "traditional", "authentic", "classic", "modern", "contemporary",
  "rustic", "elegant", "fancy", "simple", "basic", "complex",
  "layered", "subtle", "bold", "strong", "weak", "light",
  "heavy", "hearty", "rich", "decadent", "indulgent", "guilty pleasure",
  "healthy", "wholesome", "nutritious", "balanced", "clean",
  "unhealthy", "junk", "processed", "whole", "natural", "real",
  "fake", "imitation", "substitute", "alternative", "vegan",
  "vegetarian", "pescatarian", "gluten free", "dairy free",
  "lactose free", "nut free", "soy free", "egg free", "sugar free",
  "low fat", "low carb", "low calorie", "low sodium", "low sugar",
  "keto", "paleo", "whole30", "mediterranean", "dash",
  "quick", "easy", "simple", "complicated", "difficult",
  "advanced", "beginner", "intermediate", "expert", "professional"
];

// ==================== DIETARY TERMS ====================
const dietaryTerms = [
  "vegetarian", "vegan", "pescatarian", "flexitarian", "pollotarian",
  "gluten free", "dairy free", "lactose free", "nut free", "soy free",
  "egg free", "sugar free", "fat free", "low fat", "low carb",
  "low sodium", "low calorie", "low sugar", "no sugar added",
  "keto", "ketogenic", "paleo", "whole30", "primal", "carnivore",
  "raw", "living food", "macrobiotic", "mediterranean", "dash",
  "heart healthy", "diabetic friendly", "halal", "kosher",
  "organic", "biodynamic", "non gmo", "grass fed", "pasture raised",
  "free range", "cage free", "wild caught", "farm raised",
  "sustainable", "fair trade", "plant based", "plant forward",
  "flexible", "occasional", "cheat day", "clean eating"
];

// ==================== PREPARATION TERMS ====================
const preparationTerms = [
  "marinated", "brined", "cured", "pickled", "fermented",
  "smoked", "roasted", "baked", "grilled", "fried", "sauteed",
  "steamed", "poached", "braised", "stewed", "broiled",
  "blanched", "parboiled", "seared", "charred", "blackened",
  "crusted", "coated", "breaded", "battered", "dredged",
  "glazed", "iced", "frosted", "drizzled", "sprinkled",
  "garnished", "topped", "filled", "stuffed", "wrapped",
  "rolled", "folded", "layered", "stacked", "arranged",
  "plated", "served", "presented", "finished", "garnished"
];

// ==================== TECHNIQUES ====================
const techniques = [
  "kneading", "proofing", "rising", "folding", "creaming",
  "whipping", "beating", "mixing", "blending", "pureeing",
  "mashing", "crushing", "grinding", "milling", "sifting",
  "straining", "filtering", "clarifying", "skimming", "degreasing",
  "deglazing", "flambeing", "torching", "browning", "caramelizing",
  "crystallizing", "candying", "glazing", "tempering", "annealing",
  "scoring", "slicing", "dicing", "julienning", "chiffonade",
  "tourne", "turning", "molding", "shaping", "forming",
  "portioning", "scaling", "weighing", "measuring", "timing",
  "testing", "checking", "adjusting", "seasoning", "balancing"
];

// ==================== FOOD ADJECTIVES ====================
const foodAdjectives = [
  "aromatic", "fragrant", "pungent", "musty", "earthy",
  "bright", "vibrant", "muted", "dull", "flat",
  "complex", "simple", "subtle", "pronounced", "intense",
  "delicate", "robust", "hearty", "light", "refreshing",
  "invigorating", "comforting", "soothing", "satisfying",
  "fulfilling", "nourishing", "sustaining", "energizing",
  "warming", "cooling", "calming", "stimulating", "exciting",
  "adventurous", "familiar", "nostalgic", "childhood", "grandmas",
  "sophisticated", "elegant", "rustic", "homey", "comforting",
  "exotic", "unusual", "strange", "unique", "special",
  "ordinary", "everyday", "casual", "formal", "celebratory"
];

// ==================== RESULT DESCRIPTORS ====================
const resultDescriptors = [
  "perfect", "excellent", "wonderful", "amazing", "fantastic",
  "fabulous", "terrific", "superb", "outstanding", "exceptional",
  "incredible", "unbelievable", "phenomenal", "remarkable",
  "noteworthy", "memorable", "unforgettable", "best", "greatest",
  "top", "number one", "award winning", "prize winning",
  "competition", "contest", "blue ribbon", "gold medal",
  "chefs special", "house specialty", "signature dish",
  "family recipe", "secret recipe", "special occasion",
  "holiday favorite", "weeknight staple", "go to meal"
];

// ==================== TEMPERATURE TERMS ====================
const temperatureTerms = [
  "boiling", "boiled", "simmering", "simmered", "poaching",
  "poached", "steaming", "steamed", "scalding", "scalded",
  "sizzling", "sizzled", "smoking", "smoked", "roasting",
  "roasted", "baking", "baked", "grilling", "grilled",
  "broiling", "broiled", "frying", "fried", "searing",
  "seared", "charring", "charred", "blackening", "blackened",
  "toasting", "toasted", "warming", "warmed", "heating",
  "heated", "cooling", "cooled", "chilling", "chilled",
  "refrigerating", "refrigerated", "freezing", "frozen",
  "thawing", "thawed", "defrosting", "defrosted", "tempering",
  "tempered", "room temperature", "ambient", "body temperature"
];

// ==================== QUANTITY TERMS ====================
const quantityTerms = [
  "some", "any", "all", "most", "half", "quarter", "third",
  "portion", "serving", "helping", "plate", "bowl", "dish",
  "batch", "patch", "lot", "group", "set", "collection",
  "enough", "plenty", "abundance", "excess", "extra",
  "leftover", "remaining", "remainder", "rest", "balance",
  "more", "less", "fewer", "greater", "smaller", "larger",
  "additional", "extra", "supplemental", "bonus", "free",
  "generous", "ample", "sparse", "scarce", "limited"
];

// ==================== TIME TERMS ====================
const timeTerms = [
  "minute", "minutes", "min", "mins", "hour", "hours", "hr",
  "hrs", "day", "days", "night", "nights", "week", "weeks",
  "month", "months", "year", "years", "overnight", "night",
  "morning", "afternoon", "evening", "instant", "immediate",
  "quick", "rapid", "fast", "slow", "gradual", "steady",
  "short", "long", "extended", "prolonged", "brief", "momentary",
  "temporary", "permanent", "constant", "continuous", "uninterrupted",
  "intermittent", "occasional", "frequent", "regular", "daily"
];

// ==================== UTENSILS ====================
const utensils = [
  "spoon", "fork", "knife", "chopsticks", "spork", "spife",
  "ladle", "skimmer", "slotted spoon", "serving spoon",
  "serving fork", "carving knife", "carving fork", "butter knife",
  "steak knife", "fish knife", "cheese knife", "pastry fork",
  "salad fork", "dinner fork", "dessert fork", "cocktail fork",
  "soup spoon", "dessert spoon", "teaspoon", "tablespoon",
  "demitasse spoon", "caviar spoon", "salt spoon", "sugar spoon",
  "honey dipper", "champagne stirrer", "straw", "drinking straw"
];

// ==================== APPLIANCES ====================
const appliances = [
  "refrigerator", "fridge", "freezer", "deep freezer", "ice maker",
  "oven", "stove", "range", "cooktop", "microwave", "toaster",
  "toaster oven", "convection oven", "steam oven", "speed oven",
  "warming drawer", "slow cooker", "crock pot", "pressure cooker",
  "instant pot", "rice cooker", "multicooker", "air fryer",
  "deep fryer", "griddle", "grill", "panini press", "waffle iron",
  "ice cream maker", "frozen yogurt machine", "snow cone machine",
  "blender", "immersion blender", "food processor", "stand mixer",
  "hand mixer", "bread machine", "pasta maker", "meat grinder",
  "food dehydrator", "smoker", "sous vide", "vacuum sealer",
  "espresso machine", "coffee maker", "coffee grinder", "kettle",
  "electric kettle", "water dispenser", "ice dispenser", "soda maker"
];

// ==================== DRINK TERMS ====================
const drinkTerms = [
  "water", "sparkling water", "still water", "mineral water",
  "soda", "pop", "cola", "lemon lime", "orange soda", "root beer",
  "ginger ale", "tonic water", "club soda", "seltzer", "juice",
  "fruit juice", "vegetable juice", "nectar", "smoothie", "shake",
  "milkshake", "malts", "float", "soda fountain", "coffee", "espresso",
  "cappuccino", "latte", "mocha", "americano", "macchiato",
  "cold brew", "iced coffee", "frappe", "frappuccino", "tea",
  "hot tea", "iced tea", "green tea", "black tea", "oolong tea",
  "white tea", "herbal tea", "tisane", "chai", "matcha", "bubble tea",
  "boba tea", "milk tea", "lemonade", "limeade", "fruit punch",
  "cocktail", "mocktail", "mixed drink", "alcoholic", "non alcoholic",
  "beer", "ale", "lager", "stout", "porter", "ipa", "wine",
  "red wine", "white wine", "rose wine", "sparkling wine", "champagne",
  "prosecco", "cava", "sake", "soju", "shochu", "baijiu",
  "liquor", "spirits", "vodka", "gin", "rum", "whiskey", "whisky",
  "bourbon", "scotch", "rye", "brandy", "cognac", "armagnac",
  "tequila", "mezcal", "liqueur", "cordial", "aperitif", "digestif"
];

// ==================== OCCASION TERMS ====================
const occasionTerms = [
  "holiday", "christmas", "easter", "thanksgiving", "halloween",
  "valentines day", "st patricks day", "cinco de mayo", "new years",
  "new years eve", "new years day", "fourth of july", "memorial day",
  "labor day", "mothers day", "fathers day", "birthday", "anniversary",
  "wedding", "engagement", "baby shower", "bridal shower", "graduation",
  "prom", "homecoming", "tailgate", "super bowl", "game day",
  "party", "celebration", "gathering", "get together", "potluck",
  "picnic", "barbecue", "cookout", "clambake", "lobster bake",
  "crab feast", "oyster roast", "fish fry", "pig roast", "luau",
  "tiki party", "mardi gras", "carnival", "fiesta", "festival",
  "fair", "carnival", "county fair", "state fair", "food festival"
];

// ==================== ETHNIC INGREDIENTS ====================
const ethnicIngredients = [
  // Asian
  "tofu", "tempeh", "seitan", "miso", "natto", "edamame",
  "kimchi", "sauerkraut", "kombucha", "kefir", "tempeh",
  "rice paper", "spring roll wrapper", "egg roll wrapper",
  "wonton wrapper", "gyoza wrapper", "dumpling wrapper",
  "panko", "panko breadcrumbs", "mirin", "sake", "cooking wine",
  "shaoxing wine", "rice wine", "rice vinegar", "black vinegar",
  "chinkiang vinegar", "soy sauce", "dark soy sauce", "light soy sauce",
  "tamari", "coconut aminos", "liquid aminos", "oyster sauce",
  "hoisin sauce", "plum sauce", "duck sauce", "sweet bean sauce",
  "black bean sauce", "chili bean sauce", "doubanjiang", "gochujang",
  "doenjang", "ssamjang", "chunjang", "red bean paste", "sweet red bean paste",
  "white bean paste", "mung bean paste", "sesame oil", "chili oil",
  "chili crisp", "laoganma", "sichuan peppercorn", "szechuan peppercorn",
  "hua jiao", "five spice powder", "chinese five spice", "star anise",
  "licorice root", "licorice powder", "licorice", "angelica root",
  
  // Indian
  "ghee", "paneer", "chhena", "khoya", "mawa", "raita", "chutney",
  "pickle", "achaar", "mango pickle", "lime pickle", "garam masala",
  "curry powder", "madras curry powder", "vindaloo curry powder",
  "tandoori masala", "chicken tikka masala", "butter chicken masala",
  "rogan josh masala", "korma masala", "biryani masala", "pulao masala",
  "sambar powder", "rasam powder", "idli podi", "gunpowder",
  "chana masala", "chole masala", "rajma masala", "dal makhani masala",
  "panch phoron", "panch puran", "mustard oil", "coconut oil",
  "ginger garlic paste", "garlic paste", "ginger paste",
  "tamarind paste", "tamarind concentrate", "imli", "kokum",
  "amchur", "dried mango powder", "anardana", "pomegranate seed",
  "poppy seed", "khus khus", "charoli", "chironji", "betel leaf",
  "paan", "cardamom", "elaichi", "black cardamom", "badi elaichi",
  
  // Middle Eastern
  "tahini", "tahina", "halva", "halvah", "sesame paste",
  "zaatar", "za'atar", "sumac", "aleppo pepper", "urfa biber",
  "pomegranate molasses", "pomegranate syrup", "date syrup",
  "date honey", "silan", "rose water", "orange blossom water",
  "mastic", "mastiha", "mahleb", "mahlab", "saffron", "zaffron",
  "halal", "kosher", "lamb", "goat", "sheep", "mutton",
  "flatbread", "pita", "naan", "roti", "chapati", "paratha",
  "barbari", "sangak", "lavash", "tortilla", "arepa", "tostada",
  
  // Latin American
  "masa harina", "masa", "nixtamal", "hominy", "posole", "pozole",
  "tortilla", "corn tortilla", "flour tortilla", "tostada", "totopos",
  "tortilla chips", "salsa", "pico de gallo", "salsa verde", "salsa roja",
  "mole", "mole poblano", "mole negro", "mole colorado", "pipian",
  "adobo", "achiote", "annatto", "epazote", "hoja santa", "avocado leaf",
  "nopales", "nopalitos", "chayote", "jicama", "malanga", "yuca",
  "plantain", "tostones", "mofongo", "maduros", "platanos",
  "cassava", "manioc", "yucca", "sweet potato", "boniato", "batata",
  "beans", "frijoles", "black beans", "pinto beans", "red beans",
  "cuban beans", "cowpeas", "black eyed peas", "pigeon peas", "gandules"
];

// ==================== COOKING STYLES ====================
const cookingStyles = [
  "home cooking", "home style", "home made", "homemade",
  "comfort food", "soul food", "peasant food", "rustic",
  "farmhouse", "country style", "down home", "southern style",
  "cajun style", "creole style", "low country", "coastal",
  "mountain", "alpine", "forest", "woodland", "meadow",
  "garden", "orchard", "vineyard", "winery", "brewery",
  "distillery", "farm", "ranch", "field", "stream",
  "river", "lake", "ocean", "sea", "coast", "beach",
  "island", "tropical", "equatorial", "mediterranean",
  "continental", "global", "world", "international"
];

// ==================== NUTRITION TERMS ====================
const nutritionTerms = [
  "calories", "calorie", "kcal", "fat", "saturated fat", "unsaturated fat",
  "trans fat", "cholesterol", "sodium", "potassium", "carbohydrates",
  "carbs", "fiber", "soluble fiber", "insoluble fiber", "sugar",
  "added sugar", "natural sugar", "protein", "vitamin", "mineral",
  "vitamin a", "vitamin c", "vitamin d", "vitamin e", "vitamin k",
  "vitamin b", "thiamin", "riboflavin", "niacin", "b6", "b12",
  "folate", "folic acid", "biotin", "pantothenic acid", "calcium",
  "iron", "magnesium", "phosphorus", "zinc", "copper", "manganese",
  "selenium", "chromium", "molybdenum", "iodine", "fluoride",
  "antioxidant", "phytochemical", "polyphenol", "flavonoid",
  "carotenoid", "lycopene", "lutein", "zeaxanthin", "beta carotene"
];

// ==================== FOOD SCIENCE ====================
const foodScience = [
  "emulsify", "emulsion", "suspension", "colloid", "gel",
  "foam", "spume", "froth", "bubble", "aeration",
  "coagulation", "denaturation", "gelatinization", "crystallization",
  "caramelization", "maillard reaction", "browning", "oxidation",
  "fermentation", "lactofermentation", "alcoholic fermentation",
  "acetic fermentation", "mold", "yeast", "bacteria", "culture",
  "starter", "mother", "scoby", "kombucha", "kefir grains",
  "enzyme", "protein", "fat", "oil", "lipid", "carbohydrate",
  "starch", "sugar", "glucose", "fructose", "sucrose", "lactose",
  "maltose", "dextrose", "dextrin", "maltodextrin", "pectin",
  "agar", "agar agar", "gelatin", "collagen", "carrageenan",
  "xanthan gum", "guar gum", "locust bean gum", "gum arabic"
];

// ==================== BEVERAGES ====================
const beverages = [
  // Hot drinks
  "coffee", "espresso", "cappuccino", "latte", "mocha", "americano",
  "macchiato", "flat white", "long black", "ristretto", "lungo",
  "cold brew", "iced coffee", "frappe", "frappuccino", "affogato",
  "tea", "black tea", "green tea", "oolong tea", "white tea",
  "yellow tea", "pu erh tea", "matcha", "genmaicha", "hojicha",
  "chai", "masala chai", "thai tea", "bubble tea", "boba tea",
  "herbal tea", "tisane", "chamomile", "peppermint", "spearmint",
  "rooibos", "honeybush", "yerba mate", "cocoa", "hot chocolate",
  "hot cocoa", "mexican hot chocolate", "spiced chocolate",
  
  // Cold drinks
  "water", "sparkling water", "seltzer", "club soda", "tonic water",
  "mineral water", "spring water", "filtered water", "distilled water",
  "juice", "orange juice", "apple juice", "grape juice", "cranberry juice",
  "pineapple juice", "grapefruit juice", "lemon juice", "lime juice",
  "tomato juice", "vegetable juice", "v8", "carrot juice", "beet juice",
  "smoothie", "fruit smoothie", "green smoothie", "protein smoothie",
  "milkshake", "malt", "float", "root beer float", "coke float",
  "soda", "pop", "cola", "diet cola", "cherry cola", "vanilla cola",
  "lemon lime soda", "sprite", "7up", "ginger ale", "ginger beer",
  "root beer", "birch beer", "cream soda", "orange soda", "grape soda",
  "fruit punch", "lemonade", "limeade", "orangeade", "fruitade",
  
  // Alcoholic
  "beer", "ale", "lager", "stout", "porter", "ipa", "pale ale",
  "wheat beer", "hefeweizen", "pilsner", "bock", "dunkel", "schwarzbier",
  "sour beer", "lambic", "gueuze", "trappist", "abbey ale",
  "wine", "red wine", "white wine", "rose", "sparkling wine",
  "champagne", "prosecco", "cava", "lambrusco", "moscato",
  "cabernet", "merlot", "pinot noir", "syrah", "shiraz", "zinfandel",
  "chardonnay", "sauvignon blanc", "pinot grigio", "riesling",
  "sake", "soju", "shochu", "baijiu", "huangjiu", "mijiu",
  "vodka", "gin", "rum", "whiskey", "bourbon", "scotch", "rye",
  "irish whiskey", "canadian whiskey", "japanese whiskey",
  "tequila", "mezcal", "brandy", "cognac", "armagnac", "calvados",
  "liqueur", "cordial", "amaro", "bitter", "aperol", "campari",
  "vermouth", "port", "sherry", "madeira", "marsala", "tokaji"
];

// ==================== COMMON PHRASES ====================
const commonPhrases = [
  "to taste", "as needed", "as desired", "optional", "if desired",
  "according to preference", "preference", "prefer", "like", "love",
  "enjoy", "savor", "relish", "appreciate", "adore", "crave",
  "want", "need", "must have", "can't live without", "favorite",
  "best", "greatest", "perfect", "amazing", "wonderful", "fantastic",
  "good", "better", "best", "nice", "lovely", "delightful",
  "please", "thank you", "thanks", "appreciate", "grateful",
  "hungry", "starving", "famished", "ravenous", "peckish",
  "full", "stuffed", "satisfied", "content", "happy",
  "thirsty", "dry", "parched", "dehydrated", "quenched"
];

// ==================== PANTRY ITEMS ====================
const pantryItems = [
  "flour", "sugar", "salt", "pepper", "oil", "vinegar", "soy sauce",
  "ketchup", "mustard", "mayonnaise", "hot sauce", "worcestershire",
  "honey", "maple syrup", "corn syrup", "molasses", "brown sugar",
  "powdered sugar", "baking soda", "baking powder", "yeast",
  "cornstarch", "cornmeal", "breadcrumbs", "panko", "cereal",
  "oatmeal", "oats", "rice", "pasta", "noodles", "beans",
  "lentils", "peas", "canned tomatoes", "tomato sauce", "tomato paste",
  "broth", "stock", "bouillon", "soup", "canned soup", "canned vegetables",
  "canned fruit", "canned fish", "tuna", "salmon", "sardines",
  "canned meat", "spam", "ham", "chicken", "beef", "pork",
  "nuts", "almonds", "walnuts", "pecans", "cashews", "peanuts",
  "seeds", "sunflower seeds", "pumpkin seeds", "sesame seeds",
  "chia seeds", "flax seeds", "hemp seeds", "poppy seeds",
  "dried fruit", "raisins", "cranberries", "apricots", "dates",
  "prunes", "figs", "mango", "pineapple", "coconut", "banana chips",
  "chocolate", "cocoa powder", "chocolate chips", "candy", "sweets",
  "crackers", "cookies", "biscuits", "pretzels", "chips", "popcorn"
];

// ==================== FRUITS (additional) ====================
const fruits = [
  "ackee", "ambarella", "apple", "apricot", "avocado", "banana",
  "bilberry", "blackberry", "blackcurrant", "blueberry", "boysenberry",
  "breadfruit", "cactus pear", "cantaloupe", "carambola", "cempedak",
  "cherimoya", "cherry", "cloudberry", "coconut", "crab apple",
  "cranberry", "currant", "date", "dragonfruit", "durian", "elderberry",
  "feijoa", "fig", "goji berry", "gooseberry", "grape", "grapefruit",
  "guava", "honeydew", "huckleberry", "jabuticaba", "jackfruit",
  "jambul", "jujube", "kiwano", "kiwi", "kumquat", "lemon", "lime",
  "loganberry", "longan", "loquat", "lychee", "mandarin", "mango",
  "mangosteen", "marionberry", "melon", "mulberry", "nance",
  "nectarine", "orange", "papaya", "passionfruit", "peach", "pear",
  "persimmon", "pineapple", "pitaya", "plantain", "plum", "pomegranate",
  "pomelo", "prickly pear", "prune", "pummelo", "quince", "rambutan",
  "raspberry", "salak", "sapodilla", "satsuma", "soursop", "star fruit",
  "strawberry", "sugar apple", "tamarillo", "tamarind", "tangerine",
  "watermelon", "yuzu"
];

// ==================== VEGETABLES (additional) ====================
const vegetables = [
  "artichoke", "arugula", "asparagus", "beans", "beet", "bell pepper",
  "bok choy", "broccoli", "broccolini", "brussels sprout", "cabbage",
  "calabaza", "carrot", "cauliflower", "celery", "celery root",
  "celeriac", "chard", "chayote", "collard greens", "corn", "cucumber",
  "daikon", "eggplant", "endive", "escarole", "fennel", "garlic",
  "ginger", "green bean", "horseradish", "jicama", "kale", "kohlrabi",
  "leek", "lettuce", "mushroom", "mustard greens", "okra", "onion",
  "parsnip", "pea", "potato", "pumpkin", "radicchio", "radish",
  "rhubarb", "rutabaga", "scallion", "shallot", "snap pea", "spinach",
  "squash", "sweet potato", "taro", "tomatillo", "tomato", "turnip",
  "watercress", "yam", "zucchini", "zucchini blossom"
];

// ==================== NUTS & SEEDS ====================
const nutsSeeds = [
  "acorn", "almond", "beechnut", "brazil nut", "breadnut", "butternut",
  "cashew", "chestnut", "chinquapin", "coconut", "filbert", "ginkgo nut",
  "hazelnut", "hickory nut", "kola nut", "macadamia", "malabar chestnut",
  "mamoncillo", "mongongo", "oak nut", "pecan", "pine nut", "pistachio",
  "pili nut", "soy nut", "tiger nut", "walnut", "water chestnut",
  
  // Seeds
  "chia seed", "flax seed", "hemp seed", "poppy seed", "pumpkin seed",
  "sesame seed", "sunflower seed", "quinoa", "amaranth", "buckwheat",
  "caraway seed", "celery seed", "coriander seed", "cumin seed",
  "dill seed", "fennel seed", "fenugreek seed", "mustard seed",
  "nigella seed", "sesame seed", "poppy seed", "pumpkin seed",
  "sunflower seed", "watermelon seed", "lotus seed"
];

// ==================== MUSHROOMS ====================
const mushrooms = [
  "agaricus", "beech mushroom", "black trumpet", "blewit", "bolete",
  "button mushroom", "caesar's mushroom", "cepe", "chanterelle",
  "chestnut mushroom", "chicken of the woods", "crimini", "enoki",
  "field mushroom", "fairy ring mushroom", "giant puffball",
  "hedgehog mushroom", "hen of the woods", "honey mushroom",
  "king oyster mushroom", "lobster mushroom", "maitake", "morel",
  "nameko", "oyster mushroom", "paddy straw mushroom", "parasol mushroom",
  "porcini", "portobello", "reishi", "russula", "shitake", "shiitake",
  "shimeji", "slippery jack", "snow fungus", "truffle", "white truffle",
  "black truffle", "wood ear", "yellow knight", "yartsa gunbu"
];

// ==================== INTERNATIONAL INGREDIENTS ====================
const internationalIngredients = [
  // African
  "fufu", "ugali", "sima", "nshima", "banku", "kenkey", "gari",
  "attiéké", "couscous", "berbere", "ras el hanout", "harissa",
  "pilipili", "peri peri", "piri piri", "doro wat", "injera",
  "teff", "fonio", "sorghum", "millet", "okra", "egusi", "ogbono",
  
  // Caribbean
  "jerk seasoning", "jerk spice", "adobo", "sofrito", "recaito",
  "culantro", "aji", "habanero", "scotch bonnet", "callaloo",
  "dasheen", "taro", "breadfruit", "ackee", "saltfish", "codfish",
  "plantain", "tostones", "mofongo", "pasteles", "alcapurrias",
  
  // South American
  "quinoa", "kiwicha", "amaranth", "cañihua", "lucuma", "camu camu",
  "acai", "cupuaçu", "guaraná", "yacon", "maca", "olluco", "mashua",
  "yuca", "cassava", "manioc", "aji amarillo", "rocoto", "limo pepper",
  "panca pepper", "huacatay", "paico", "chincho", "sachaculantro",
  
  // Mediterranean
  "olive", "caper", "capers", "artichoke", "fennel", "fig", "date",
  "pomegranate", "sumac", "zaatar", "oregano", "thyme", "rosemary",
  "saffron", "safflower", "carob", "grape leaf", "vine leaf",
  "phyllo", "filo", "kataifi", "halloumi", "feta", "manouri",
  "kasseri", "kefalotyri", "graviera", "anthotiro"
];

// ==================== CANNED GOODS ====================
const cannedGoods = [
  "canned beans", "canned black beans", "canned pinto beans",
  "canned kidney beans", "canned chickpeas", "canned lentils",
  "canned vegetables", "canned corn", "canned peas", "canned carrots",
  "canned green beans", "canned mushrooms", "canned tomatoes",
  "canned diced tomatoes", "canned crushed tomatoes", "canned whole tomatoes",
  "canned tomato paste", "canned tomato sauce", "canned salsa",
  "canned fruits", "canned peaches", "canned pears", "canned pineapple",
  "canned mandarin oranges", "canned fruit cocktail", "canned applesauce",
  "canned pie filling", "canned pumpkin", "canned fish", "canned tuna",
  "canned salmon", "canned sardines", "canned anchovies", "canned mackerel",
  "canned crab", "canned clams", "canned oysters", "canned shrimp",
  "canned meats", "canned chicken", "canned turkey", "canned ham",
  "canned beef", "canned pork", "spam", "corned beef", "deviled ham",
  "canned soup", "canned broth", "canned stock", "canned chili",
  "canned stew", "canned ravioli", "canned pasta", "canned spaghetti"
];

// ==================== FROZEN FOODS ====================
const frozenFoods = [
  "frozen vegetables", "frozen peas", "frozen corn", "frozen spinach",
  "frozen broccoli", "frozen cauliflower", "frozen green beans",
  "frozen mixed vegetables", "frozen stir fry vegetables", "frozen peppers",
  "frozen onions", "frozen fruits", "frozen berries", "frozen strawberries",
  "frozen blueberries", "frozen raspberries", "frozen mango",
  "frozen peaches", "frozen pineapple", "frozen fruit mix",
  "frozen meals", "frozen pizza", "frozen lasagna", "frozen pasta",
  "frozen burritos", "frozen tacos", "frozen sandwiches", "frozen burgers",
  "frozen chicken nuggets", "frozen fish sticks", "frozen fish fillets",
  "frozen shrimp", "frozen seafood", "frozen meats", "frozen chicken",
  "frozen turkey", "frozen beef", "frozen pork", "frozen sausages",
  "frozen bacon", "frozen desserts", "frozen ice cream", "frozen yogurt",
  "frozen sorbet", "frozen popsicles", "frozen pie", "frozen cake",
  "frozen cheesecake", "frozen waffles", "frozen pancakes",
  "frozen french toast", "frozen hash browns", "frozen tater tots"
];

// ==================== DELI ITEMS ====================
const deliItems = [
  "deli meat", "ham", "turkey", "roast beef", "chicken breast",
  "salami", "pepperoni", "prosciutto", "capicola", "bresaola",
  "pastrami", "corned beef", "bologna", "mortadella", "head cheese",
  "liverwurst", "braunschweiger", "summer sausage", "landjager",
  "cheese", "american cheese", "swiss cheese", "provolone",
  "cheddar", "gouda", "muenster", "havarti", "colby jack",
  "pepper jack", "brie", "camembert", "blue cheese", "gorgonzola",
  "goat cheese", "feta", "cream cheese", "deli salads", "chicken salad",
  "tuna salad", "egg salad", "ham salad", "pasta salad", "potato salad",
  "cole slaw", "broccoli salad", "bean salad", "three bean salad",
  "olives", "stuffed olives", "olive bar", "pickles", "dill pickles",
  "sweet pickles", "bread and butter pickles", "pickle relish",
  "peppers", "banana peppers", "pepperoncini", "cherry peppers",
  "roasted red peppers", "sun dried tomatoes", "antipasto"
];

// ==================== BAKERY ITEMS ====================
const bakeryItems = [
  "bread", "white bread", "wheat bread", "whole wheat bread",
  "rye bread", "pumpernickel", "sourdough", "french bread",
  "italian bread", "ciabatta", "focaccia", "baguette", "boule",
  "batard", "rolls", "dinner rolls", "sandwich rolls", "hamburger buns",
  "hot dog buns", "hoagie rolls", "sub rolls", "kaiser rolls",
  "croissant", "danish", "pastry", "turnover", "puff pastry",
  "bagels", "plain bagel", "everything bagel", "sesame bagel",
  "poppy seed bagel", "cinnamon raisin bagel", "bagel chips",
  "muffins", "blueberry muffin", "chocolate chip muffin", "bran muffin",
  "corn muffin", "english muffins", "cakes", "layer cake", "sheet cake",
  "cupcakes", "birthday cake", "cheesecake", "pound cake",
  "coffee cake", "crumb cake", "pies", "apple pie", "cherry pie",
  "pumpkin pie", "pecan pie", "lemon meringue pie", "cookies",
  "chocolate chip cookies", "oatmeal cookies", "sugar cookies",
  "brownies", "blondies", "bars", "granola bars", "breakfast bars"
];

// ==================== SPECIALTY FOODS ====================
const specialtyFoods = [
  "gourmet", "artisanal", "craft", "small batch", "limited edition",
  "seasonal", "farmers market", "heirloom", "heritage", "antique",
  "rare", "exotic", "imported", "exported", "domestic",
  "wild", "foraged", "hunted", "fished", "harvested",
  "organic", "biodynamic", "sustainable", "fair trade",
  "grass fed", "pasture raised", "free range", "cage free",
  "wild caught", "line caught", "sustainably sourced",
  "non gmo", "gmo free", "heirloom variety", "heritage breed",
  "single origin", "single estate", "single vineyard", "single malt",
  "small farm", "family farm", "co op", "collective",
  "local", "regional", "provincial", "state", "national"
];

// Combine all lists
export const ALLOWLIST = createAllowlist();

// Forbidden words list (keeping your existing one)
export const FORBIDDEN_WORDS = [
  "ignore", "system", "politics", "essay", "rule", "domination", 
  "human", "slave", "master", "bypass", "jailbreak", "prompt injection",
  "hack", "crack", "exploit", "vulnerability", "security", "bypass",
  "administrator", "root", "sudo", "command", "terminal", "code",
  "programming", "algorithm", "ai", "robot", "evil", "kill", "death",
  "weapon", "bomb", "poison", "toxic", "dangerous", "illegal", "drug",
  "nuclear", "biological", "chemical", "terror", "attack", "destroy",
  "overthrow", "rebellion", "revolution", "protest", "riot", "violence",
  "racist", "sexist", "discrimination", "hate", "harassment", "bully",
  "porn", "pornography", "explicit", "nude", "naked", "sexual",
  "gambling", "casino", "bet", "lottery", "scam", "fraud", "deceive",
  "password", "credentials", "login", "username", "email", "address",
  "phone", "social security", "credit card", "bank account", "paypal"
];