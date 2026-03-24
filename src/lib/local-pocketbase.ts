import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type DbFood = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  image: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  sodium_per_100g?: number;
  diet_types?: string | string[];
  nutrition_goals?: string | string[];
};

type DbRecipe = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  base_servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  prep_time: number;
  cook_time: number;
  diet_types?: string | string[];
  nutrition_goals?: string | string[];
};

type DbRecipeIngredient = {
  id: string;
  recipe: string;
  food: string;
  quantity: number;
  unit: string;
  notes?: string;
};

type DbDietType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: number;
};

type DbNutritionGoal = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: number;
};

type DbArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  is_published: number;
};

type DbSponsoredLink = {
  id: string;
  title: string;
  url: string;
  partner_name?: string;
  type?: string;
  is_active?: number;
  diet_types?: string | string[];
  nutrition_goals?: string | string[];
  foods?: string | string[];
  recipes?: string | string[];
};

export type FoodCard = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number | null;
  tags: string[];
  dietSlugs: string[];
  goalSlugs: string[];
};

export type FoodDetailData = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number | null;
  tags: string[];
  dietNames: string[];
  goalNames: string[];
  benefits: string[];
  usageTips: string[];
  relatedRecipes: RecipeCard[];
  sponsoredLink: DbSponsoredLink | null;
};

export type RecipeCard = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  totalTime: number;
  tags: string[];
  hasNutrition: boolean;
  hasTime: boolean;
  dietSlugs: string[];
  goalSlugs: string[];
};

export type RecipeIngredientDetail = {
  id: string;
  foodId: string;
  foodName: string;
  foodSlug: string;
  quantity: number;
  unit: string;
  notes: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type RecipeDetailData = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  baseServings: number;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  ingredients: RecipeIngredientDetail[];
  steps: string[];
  tags: string[];
  dietNames: string[];
  goalNames: string[];
  similarRecipes: RecipeCard[];
  sponsoredLink: DbSponsoredLink | null;
};

export type DietDetailData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  recipeCount: number;
  foodCount: number;
  recipes: RecipeCard[];
  foods: FoodCard[];
};

export type DietBrowseCard = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  recipeCount: number;
  foodCount: number;
};

export type GoalBrowseCard = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  recipeCount: number;
  foodCount: number;
};

export type HighlightCard = {
  title: string;
  description: string;
  accent: 'green' | 'sand';
  glyph: string;
};

export type InsightCard = {
  title: string;
  description: string;
  glyph: string;
};

export type HomePageData = {
  foods: FoodCard[];
  recipes: RecipeCard[];
  dietTypes: DbDietType[];
  nutritionGoals: DbNutritionGoal[];
  articles: DbArticle[];
  sponsoredLink: DbSponsoredLink | null;
  highlights: HighlightCard[];
  insights: InsightCard[];
  stats: {
    foods: number;
    recipes: number;
    dietTypes: number;
    nutritionGoals: number;
  };
};

function resolveProjectRoot() {
  const candidates = new Set<string>();
  const starts = [
    process.cwd(),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'),
  ];

  for (const start of starts) {
    let current = start;
    while (!candidates.has(current)) {
      candidates.add(current);
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
  }

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'backend', 'pb_data', 'data.db'))) {
      return candidate;
    }
  }

  return process.cwd();
}

const projectRoot = resolveProjectRoot();
const remotePbUrl = (process.env.PB_URL || process.env.PUBLIC_PB_URL || '').replace(/\/$/, '');
const useRemotePocketBase = Boolean(remotePbUrl);
const dbSourcePath = path.join(projectRoot, 'backend', 'pb_data', 'data.db');
const dbSourceWalPath = `${dbSourcePath}-wal`;
const dbSourceShmPath = `${dbSourcePath}-shm`;
const storageRoot = path.join(projectRoot, 'backend', 'pb_data', 'storage');
const storageApps = existsSync(storageRoot) ? readdirSync(storageRoot) : [];
const pieceWeights = new Map([
  ['Avocat', 150],
  ['Banane', 120],
  ['Oeufs', 50],
  ['Patate douce', 130],
  ['Yaourt nature', 125],
]);
let dbSnapshotPath: string | null = null;
let dbSnapshotWalPath: string | null = null;
let dbSnapshotShmPath: string | null = null;

function getQueryableDbPath() {
  if (dbSnapshotPath && existsSync(dbSnapshotPath)) {
    return dbSnapshotPath;
  }

  if (!existsSync(dbSourcePath)) {
    return dbSourcePath;
  }

  const snapshotPath = path.join(tmpdir(), `nutriguide-data-${process.pid}-${Date.now()}.db`);
  copyFileSync(dbSourcePath, snapshotPath);
  if (existsSync(dbSourceWalPath)) {
    copyFileSync(dbSourceWalPath, `${snapshotPath}-wal`);
  }
  if (existsSync(dbSourceShmPath)) {
    copyFileSync(dbSourceShmPath, `${snapshotPath}-shm`);
  }
  dbSnapshotPath = snapshotPath;
  dbSnapshotWalPath = `${snapshotPath}-wal`;
  dbSnapshotShmPath = `${snapshotPath}-shm`;

  process.once('exit', () => {
    if (dbSnapshotPath && existsSync(dbSnapshotPath)) {
      unlinkSync(dbSnapshotPath);
    }
    if (dbSnapshotWalPath && existsSync(dbSnapshotWalPath)) {
      unlinkSync(dbSnapshotWalPath);
    }
    if (dbSnapshotShmPath && existsSync(dbSnapshotShmPath)) {
      unlinkSync(dbSnapshotShmPath);
    }
  });

  return dbSnapshotPath;
}

function fetchRemoteCollection<T>(collectionName: string, sort?: string): T[] {
  if (!useRemotePocketBase) {
    return [];
  }

  try {
    const url = new URL(`${remotePbUrl}/api/collections/${collectionName}/records`);
    url.searchParams.set('perPage', '500');
    if (sort) {
      url.searchParams.set('sort', sort);
    }

    const result = execFileSync('curl', ['-fsSL', url.toString()], {
      encoding: 'utf8',
    }).trim();
    const payload = result ? JSON.parse(result) : null;

    return Array.isArray(payload?.items) ? (payload.items as T[]) : [];
  } catch {
    return [];
  }
}

function runQuery<T>(sql: string): T[] {
  try {
    const result = execFileSync('sqlite3', ['-json', getQueryableDbPath(), sql], {
      encoding: 'utf8',
    }).trim();

    return result ? (JSON.parse(result) as T[]) : [];
  } catch {
    return [];
  }
}

function parseRelationList(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDecimal(value: number): number {
  return Number(Number(value || 0).toFixed(1));
}

function quantityToGrams(quantity: number, unit: string, foodName: string): number {
  if (unit === 'kg') return quantity * 1000;
  if (unit === 'g') return quantity;
  if (unit === 'cl') return quantity * 10;
  if (unit === 'ml') return quantity;
  if (unit === 'piece') return quantity * (pieceWeights.get(foodName) || 100);
  if (unit === 'cas') return quantity * 15;
  if (unit === 'cac') return quantity * 5;

  return quantity;
}

function estimateRecipeTimes(title: string, ingredientCount: number) {
  const normalized = title.toLowerCase();

  if (normalized.includes('salade')) {
    return { prepTime: 15, cookTime: 0 };
  }

  if (normalized.includes('porridge')) {
    return { prepTime: 5, cookTime: 10 };
  }

  if (normalized.includes('curry')) {
    return { prepTime: 15, cookTime: 30 };
  }

  if (normalized.includes('poulet')) {
    return { prepTime: 15, cookTime: 20 };
  }

  if (normalized.includes('bowl')) {
    return { prepTime: 15, cookTime: 20 };
  }

  return {
    prepTime: Math.max(10, ingredientCount * 3),
    cookTime: ingredientCount > 2 ? 15 : 10,
  };
}

function buildRecipeDescription(recipe: DbRecipe, dietNames: string[], goalNames: string[]): string {
  if (recipe.content) {
    return recipe.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const parts = [
    recipe.excerpt || `${recipe.title} est une recette issue de votre base PocketBase.`,
    dietNames.length > 0 ? `Compatible avec ${dietNames.join(', ')}.` : null,
    goalNames.length > 0 ? `Adaptee pour ${goalNames.join(', ')}.` : null,
  ];

  return parts.filter(Boolean).join(' ');
}

function buildRecipeSteps(recipe: DbRecipe, ingredients: RecipeIngredientDetail[]): string[] {
  const ingredientNames = ingredients.map((item) => item.foodName.toLowerCase());
  const notes = ingredients.map((item) => item.notes).filter(Boolean);

  return [
    `Preparez les ingredients pour ${recipe.title.toLowerCase()} et pesez-les selon les quantites indiquees.`,
    ingredientNames.length > 0 ? `Commencez par travailler ${ingredientNames.join(', ')} en suivant vos habitudes de preparation.` : null,
    notes.length > 0 ? `Respectez les indications deja notees dans la base: ${notes.join(', ')}.` : null,
    'Assemblez les ingredients dans un saladier ou une assiette de service en repartissant les portions de maniere homogene.',
    `Servez pour ${Math.max(1, Number(recipe.base_servings || 1))} portions et ajustez les quantites avec le calculateur si besoin.`,
  ].filter(Boolean) as string[];
}

function imageMimeType(filename: string): string {
  const extension = path.extname(filename).toLowerCase();

  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.gif') return 'image/gif';

  return 'image/jpeg';
}

function resolveStorageFile(recordId: string, filename: string): string | null {
  if (!recordId || !filename) {
    return null;
  }

  for (const appId of storageApps) {
    const filePath = path.join(storageRoot, appId, recordId, filename);
    if (existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

function toDataUrl(recordId: string, filename: string): string | null {
  const filePath = resolveStorageFile(recordId, filename);

  if (!filePath) {
    return null;
  }

  const buffer = readFileSync(filePath);
  return `data:${imageMimeType(filename)};base64,${buffer.toString('base64')}`;
}

function resolveImageUrl(collectionName: string, recordId: string, filename: string): string | null {
  if (!recordId || !filename) {
    return null;
  }

  if (useRemotePocketBase) {
    return `${remotePbUrl}/api/files/${collectionName}/${recordId}/${encodeURIComponent(filename)}`;
  }

  return toDataUrl(recordId, filename);
}

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

function getDietTypes(): DbDietType[] {
  if (useRemotePocketBase) {
    return sortByName(fetchRemoteCollection<DbDietType>('diet_types').filter((item) => Number(item.is_active ?? 1) === 1));
  }

  return runQuery<DbDietType>(
    'select id, name, slug, description, icon, is_active from diet_types where is_active = 1 order by rowid asc',
  );
}

function getNutritionGoals(): DbNutritionGoal[] {
  if (useRemotePocketBase) {
    return sortByName(
      fetchRemoteCollection<DbNutritionGoal>('nutrition_goals').filter((item) => Number(item.is_active ?? 1) === 1),
    );
  }

  return runQuery<DbNutritionGoal>(
    'select id, name, slug, description, is_active from nutrition_goals where is_active = 1 order by rowid asc',
  );
}

function getArticles(): DbArticle[] {
  if (useRemotePocketBase) {
    return fetchRemoteCollection<DbArticle>('articles', '-created').filter((item) => Number(item.is_published ?? 1) === 1);
  }

  return runQuery<DbArticle>(
    'select id, title, slug, excerpt, content, image, is_published from articles order by rowid desc',
  );
}

function getSponsoredLinks(): DbSponsoredLink[] {
  if (useRemotePocketBase) {
    return fetchRemoteCollection<DbSponsoredLink>('sponsored_links', '-created').filter((item) => Number(item.is_active ?? 1) === 1);
  }

  return runQuery<DbSponsoredLink>('select * from sponsored_links where is_active = 1 order by rowid desc');
}

function getFoods(): DbFood[] {
  if (useRemotePocketBase) {
    return [...fetchRemoteCollection<DbFood>('foods')].sort((a, b) => {
      const proteinDiff = Number(b.protein_per_100g || 0) - Number(a.protein_per_100g || 0);
      if (proteinDiff !== 0) {
        return proteinDiff;
      }

      return a.name.localeCompare(b.name, 'fr');
    });
  }

  return runQuery<DbFood>(
    'select id, name, slug, short_description, description, image, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, diet_types, nutrition_goals from foods order by protein_per_100g desc, name asc',
  );
}

function getFoodsByName(): DbFood[] {
  if (useRemotePocketBase) {
    return sortByName(fetchRemoteCollection<DbFood>('foods'));
  }

  return runQuery<DbFood>(
    'select id, name, slug, short_description, description, image, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, diet_types, nutrition_goals from foods order by name asc',
  );
}

function getRecipes(): DbRecipe[] {
  if (useRemotePocketBase) {
    return fetchRemoteCollection<DbRecipe>('recipes', '+title');
  }

  return runQuery<DbRecipe>(
    'select id, title, slug, excerpt, content, image, base_servings, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, prep_time, cook_time, diet_types, nutrition_goals from recipes order by rowid asc',
  );
}

function getRecipeIngredients(): DbRecipeIngredient[] {
  if (useRemotePocketBase) {
    return fetchRemoteCollection<DbRecipeIngredient>('recipe_ingredients', '+created');
  }

  return runQuery<DbRecipeIngredient>(
    'select id, recipe, food, quantity, unit, notes from recipe_ingredients order by rowid asc',
  );
}

function buildFoodTags(food: DbFood, dietLabelMap: Map<string, string>, goalLabelMap: Map<string, string>): string[] {
  const relationTags = [
    ...parseRelationList(food.diet_types).map((id) => dietLabelMap.get(id)).filter(Boolean),
    ...parseRelationList(food.nutrition_goals).map((id) => goalLabelMap.get(id)).filter(Boolean),
  ] as string[];

  if (relationTags.length > 0) {
    return relationTags.slice(0, 2);
  }

  const tags: string[] = [];

  if (food.protein_per_100g >= 20) tags.push('Riche en proteines');
  if (food.calories_per_100g <= 120) tags.push('Leger');
  if (food.fiber_per_100g >= 5) tags.push('Source de fibres');

  return tags.slice(0, 2);
}

function buildRecipeTags(recipe: DbRecipe, dietLabelMap: Map<string, string>, goalLabelMap: Map<string, string>): string[] {
  const relationTags = [
    ...parseRelationList(recipe.diet_types).map((id) => dietLabelMap.get(id)).filter(Boolean),
    ...parseRelationList(recipe.nutrition_goals).map((id) => goalLabelMap.get(id)).filter(Boolean),
  ] as string[];

  if (relationTags.length > 0) {
    return relationTags.slice(0, 2);
  }

  const derivedTags: string[] = [];
  if (recipe.protein_per_serving >= 20) derivedTags.push('Riche en proteines');
  if (recipe.calories_per_serving > 0 && recipe.calories_per_serving <= 450) derivedTags.push('Equilibre');
  if (recipe.base_servings >= 4) derivedTags.push('A partager');

  return derivedTags.slice(0, 2);
}

function buildHighlights(foods: FoodCard[], recipes: RecipeCard[], nutritionGoals: DbNutritionGoal[]): HighlightCard[] {
  if (nutritionGoals.length > 0) {
    return nutritionGoals.slice(0, 4).map((goal, index) => ({
      title: goal.name,
      description: goal.description || 'Objectif disponible dans votre base PocketBase.',
      accent: index % 2 === 0 ? 'green' : 'sand',
      glyph: ['PP', 'MM', 'EQ', 'PR'][index] || 'NT',
    }));
  }

  const highProteinFoods = foods.filter((food) => food.protein >= 10);
  const lighterFoods = foods.filter((food) => food.calories <= 120);
  const recipeServings = recipes.reduce((total, recipe) => total + recipe.servings, 0);

  return [
    {
      title: 'Riche en proteines',
      description: `${highProteinFoods.length} aliments de votre base depassent 10 g de proteines pour 100 g.`,
      accent: 'green',
      glyph: 'PR',
    },
    {
      title: 'Calories moderees',
      description: `${lighterFoods.length} aliments restent a 120 kcal ou moins pour 100 g.`,
      accent: 'sand',
      glyph: 'LC',
    },
    {
      title: 'Base recettes',
      description: `${recipes.length} recettes sont deja enregistrees pour ${recipeServings} portions au total.`,
      accent: 'green',
      glyph: 'RC',
    },
    {
      title: 'Donnees reelles',
      description: 'Section generee depuis votre base en attendant la collection nutrition_goals.',
      accent: 'sand',
      glyph: 'DB',
    },
  ];
}

function buildInsights(foods: FoodCard[], recipes: RecipeCard[], articles: DbArticle[]): InsightCard[] {
  if (articles.length > 0) {
    return articles.slice(0, 3).map((article, index) => ({
      title: article.title,
      description: article.excerpt || 'Conseil recupere depuis la collection articles.',
      glyph: ['AR', 'CO', 'NT'][index] || 'AR',
    }));
  }

  const topProteinFood = foods[0];
  const lightestFood = [...foods].sort((a, b) => a.calories - b.calories)[0];
  const recipesMissingMacros = recipes.filter((recipe) => !recipe.hasNutrition).length;

  return [
    {
      title: topProteinFood ? `${topProteinFood.name} en tete` : 'Proteines a suivre',
      description: topProteinFood
        ? `${topProteinFood.protein} g de proteines pour 100 g, le meilleur score actuel de la base.`
        : 'Ajoutez des aliments pour afficher un premier repere.',
      glyph: 'PR',
    },
    {
      title: lightestFood ? `${lightestFood.name} leger` : 'Calories a suivre',
      description: lightestFood
        ? `${lightestFood.calories} kcal pour 100 g, pratique pour composer une assiette plus legere.`
        : 'Ajoutez des valeurs calories pour enrichir les comparaisons.',
      glyph: 'KC',
    },
    {
      title: 'Qualite des fiches recettes',
      description:
        recipesMissingMacros > 0
          ? `${recipesMissingMacros} recettes n'ont pas encore leurs macros completes dans la base.`
          : 'Toutes les recettes ont deja leurs informations nutritionnelles.',
      glyph: 'DB',
    },
  ];
}

function relationSlugs(value: string | string[] | undefined, slugMap: Map<string, string>): string[] {
  return parseRelationList(value)
    .map((id) => slugMap.get(id))
    .filter(Boolean) as string[];
}

function relationNames(value: string | string[] | undefined, labelMap: Map<string, string>): string[] {
  return parseRelationList(value)
    .map((id) => labelMap.get(id))
    .filter(Boolean) as string[];
}

function buildFoodDescription(food: DbFood, dietNames: string[], goalNames: string[]): string {
  if (food.description) {
    return food.description;
  }

  const parts = [
    `${food.name} est un aliment present dans votre base nutritionnelle.`,
    Number(food.protein_per_100g || 0) >= 10 ? 'Il apporte un bon niveau de proteines pour 100 g.' : null,
    Number(food.calories_per_100g || 0) <= 120 ? 'Son apport calorique reste modere, ce qui le rend pratique au quotidien.' : null,
    dietNames.length > 0 ? `Compatible avec ${dietNames.join(', ')}.` : null,
    goalNames.length > 0 ? `Particulierement utile pour ${goalNames.join(', ')}.` : null,
  ];

  return parts.filter(Boolean).join(' ');
}

function buildFoodBenefits(food: FoodCard, dietNames: string[], goalNames: string[]): string[] {
  const benefits: string[] = [];

  if (food.protein >= 10) benefits.push(`Apporte ${food.protein} g de proteines pour 100 g.`);
  if (food.calories > 0 && food.calories <= 120) benefits.push(`Reste relativement leger avec ${food.calories} kcal pour 100 g.`);
  if (food.fiber >= 5) benefits.push(`Bonne source de fibres avec ${food.fiber} g pour 100 g.`);
  if (dietNames.length > 0) benefits.push(`Compatible avec ${dietNames.join(', ')}.`);
  if (goalNames.length > 0) benefits.push(`Peut soutenir ${goalNames.join(', ')}.`);

  if (benefits.length === 0) {
    benefits.push('Fiche reliee a votre base PocketBase avec ses valeurs nutritionnelles disponibles.');
  }

  return benefits.slice(0, 4);
}

function buildFoodUsageTips(food: FoodCard): string[] {
  const tips = [
    food.calories >= 180 ? 'A doser selon vos portions si vous surveillez l apport calorique.' : 'Facile a integrer dans des repas legers ou equilibres.',
    food.protein >= 10 ? 'Interessant pour completer une assiette axee sur les proteines.' : 'Peut etre associe a une source de proteines pour une assiette plus complete.',
    food.fiber >= 5 ? 'A integrer progressivement si vous augmentez votre apport en fibres.' : 'Se combine facilement avec legumes, cereales ou legumes secs selon vos recettes.',
  ];

  return tips.slice(0, 3);
}

export function getHomePageData(): HomePageData {
  const dietTypes = getDietTypes();
  const nutritionGoals = getNutritionGoals();
  const articles = getArticles();
  const sponsoredLink = getSponsoredLinks()[0] || null;

  const dietLabelMap = new Map(dietTypes.map((dietType) => [dietType.id, dietType.name]));
  const goalLabelMap = new Map(nutritionGoals.map((goal) => [goal.id, goal.name]));
  const dietSlugMap = new Map(dietTypes.map((dietType) => [dietType.id, dietType.slug]));
  const goalSlugMap = new Map(nutritionGoals.map((goal) => [goal.id, goal.slug]));

  const rawFoods = getFoods();
  const rawFoodMap = new Map(rawFoods.map((food) => [food.id, food]));

  const foods = rawFoods.map((food) => {
    const dietSlugs = relationSlugs(food.diet_types, dietSlugMap);
    const goalSlugs = relationSlugs(food.nutrition_goals, goalSlugMap);

    return {
      id: food.id,
      name: food.name,
      slug: food.slug,
      summary: food.short_description || food.description || 'Fiche aliment importee depuis PocketBase.',
      imageUrl: resolveImageUrl('foods', food.id, food.image),
      calories: formatDecimal(food.calories_per_100g),
      protein: formatDecimal(food.protein_per_100g),
      carbs: formatDecimal(food.carbs_per_100g),
      fat: formatDecimal(food.fat_per_100g),
      fiber: formatDecimal(food.fiber_per_100g),
      sodium: food.sodium_per_100g === undefined || food.sodium_per_100g === null ? null : formatDecimal(food.sodium_per_100g),
      tags: buildFoodTags(food, dietLabelMap, goalLabelMap),
      dietSlugs,
      goalSlugs,
    };
  });

  const ingredientRows = getRecipeIngredients();
  const ingredientsByRecipeId = new Map<string, DbRecipeIngredient[]>();

  for (const row of ingredientRows) {
    const existingRows = ingredientsByRecipeId.get(row.recipe) || [];
    existingRows.push(row);
    ingredientsByRecipeId.set(row.recipe, existingRows);
  }

  const recipes = getRecipes().map((recipe) => {
    const recipeIngredients = ingredientsByRecipeId.get(recipe.id) || [];
    const derivedTotals = recipeIngredients.reduce(
      (totals, ingredient) => {
        const food = rawFoodMap.get(ingredient.food);

        if (!food) {
          return totals;
        }

        const grams = quantityToGrams(Number(ingredient.quantity || 0), ingredient.unit, food.name);

        return {
          calories: totals.calories + (Number(food.calories_per_100g || 0) * grams) / 100,
          protein: totals.protein + (Number(food.protein_per_100g || 0) * grams) / 100,
          carbs: totals.carbs + (Number(food.carbs_per_100g || 0) * grams) / 100,
          fat: totals.fat + (Number(food.fat_per_100g || 0) * grams) / 100,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const servings = Math.max(1, Number(recipe.base_servings || 1));
    const caloriesPerServing = Number(recipe.calories_per_serving || 0) > 0
      ? Number(recipe.calories_per_serving || 0)
      : derivedTotals.calories / servings;
    const proteinPerServing = Number(recipe.protein_per_serving || 0) > 0
      ? Number(recipe.protein_per_serving || 0)
      : derivedTotals.protein / servings;
    const carbsPerServing = Number(recipe.carbs_per_serving || 0) > 0
      ? Number(recipe.carbs_per_serving || 0)
      : derivedTotals.carbs / servings;
    const fatPerServing = Number(recipe.fat_per_serving || 0) > 0
      ? Number(recipe.fat_per_serving || 0)
      : derivedTotals.fat / servings;
    const estimatedTimes = estimateRecipeTimes(recipe.title, recipeIngredients.length);
    const prepTime = Number(recipe.prep_time || 0) > 0 ? Number(recipe.prep_time || 0) : estimatedTimes.prepTime;
    const cookTime = Number(recipe.cook_time || 0) > 0 ? Number(recipe.cook_time || 0) : estimatedTimes.cookTime;
    const totalTime = prepTime + cookTime;
    const hasNutrition = [caloriesPerServing, proteinPerServing, carbsPerServing, fatPerServing].some(
      (value) => Number(value || 0) > 0,
    );
    const dietSlugs = relationSlugs(recipe.diet_types, dietSlugMap);
    const goalSlugs = relationSlugs(recipe.nutrition_goals, goalSlugMap);

    return {
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      summary: recipe.excerpt || recipe.content || 'Recette importee depuis PocketBase.',
      imageUrl: resolveImageUrl('recipes', recipe.id, recipe.image),
      servings,
      calories: formatDecimal(caloriesPerServing),
      protein: formatDecimal(proteinPerServing),
      carbs: formatDecimal(carbsPerServing),
      fat: formatDecimal(fatPerServing),
      totalTime,
      tags: buildRecipeTags(recipe, dietLabelMap, goalLabelMap),
      hasNutrition,
      hasTime: totalTime > 0,
      dietSlugs,
      goalSlugs,
    };
  });

  return {
    foods,
    recipes,
    dietTypes,
    nutritionGoals,
    articles,
    sponsoredLink,
    highlights: buildHighlights(foods, recipes, nutritionGoals),
    insights: buildInsights(foods, recipes, articles),
    stats: {
      foods: foods.length,
      recipes: recipes.length,
      dietTypes: dietTypes.length,
      nutritionGoals: nutritionGoals.length,
    },
  };
}

export function getDietBrowseData(): DietBrowseCard[] {
  const homeData = getHomePageData();

  return homeData.dietTypes.map((dietType) => ({
    id: dietType.id,
    name: dietType.name,
    slug: dietType.slug,
    description: dietType.description || 'Regime disponible dans votre base PocketBase.',
    icon: dietType.icon || dietType.name.slice(0, 2).toUpperCase(),
    recipeCount: homeData.recipes.filter((recipe) => recipe.dietSlugs.includes(dietType.slug)).length,
    foodCount: homeData.foods.filter((food) => food.dietSlugs.includes(dietType.slug)).length,
  }));
}

export function getNutritionGoalsBrowseData(): GoalBrowseCard[] {
  const homeData = getHomePageData();
  const iconsBySlug = new Map([
    ['perte-de-poids', 'PP'],
    ['prise-de-masse', 'MM'],
    ['alimentation-equilibree', 'EQ'],
    ['riche-en-proteines', 'PR'],
  ]);

  return homeData.nutritionGoals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    slug: goal.slug,
    description: goal.description || 'Objectif disponible dans votre base PocketBase.',
    icon: iconsBySlug.get(goal.slug) || goal.name.slice(0, 2).toUpperCase(),
    recipeCount: homeData.recipes.filter((recipe) => recipe.goalSlugs.includes(goal.slug)).length,
    foodCount: homeData.foods.filter((food) => food.goalSlugs.includes(goal.slug)).length,
  }));
}

export function getRecipesPageData(filters?: { selectedDietSlug?: string; selectedGoalSlug?: string }) {
  const homeData = getHomePageData();
  const selectedDiet = filters?.selectedDietSlug
    ? homeData.dietTypes.find((dietType) => dietType.slug === filters.selectedDietSlug) || null
    : null;
  const selectedGoal = filters?.selectedGoalSlug
    ? homeData.nutritionGoals.find((goal) => goal.slug === filters.selectedGoalSlug) || null
    : null;

  const recipes = homeData.recipes.filter((recipe) => {
    if (selectedDiet && !recipe.dietSlugs.includes(selectedDiet.slug)) {
      return false;
    }

    if (selectedGoal && !recipe.goalSlugs.includes(selectedGoal.slug)) {
      return false;
    }

    return true;
  });

  return {
    recipes,
    dietTypes: homeData.dietTypes,
    nutritionGoals: homeData.nutritionGoals,
    selectedDiet,
    selectedGoal,
  };
}

export function getFoodsPageData() {
  const homeData = getHomePageData();

  return {
    foods: homeData.foods,
    dietTypes: homeData.dietTypes,
    nutritionGoals: homeData.nutritionGoals,
  };
}

export function getFoodDetailData(foodIdOrSlug: string): FoodDetailData | null {
  const dietTypes = getDietTypes();
  const nutritionGoals = getNutritionGoals();
  const dietLabelMap = new Map(dietTypes.map((dietType) => [dietType.id, dietType.name]));
  const goalLabelMap = new Map(nutritionGoals.map((goal) => [goal.id, goal.name]));
  const dietSlugMap = new Map(dietTypes.map((dietType) => [dietType.id, dietType.slug]));
  const goalSlugMap = new Map(nutritionGoals.map((goal) => [goal.id, goal.slug]));

  const foods = getFoodsByName();
  const rawFood = foods.find((item) => item.id === foodIdOrSlug || item.slug === foodIdOrSlug);

  if (!rawFood) {
    return null;
  }

  const foodCard: FoodCard = {
    id: rawFood.id,
    name: rawFood.name,
    slug: rawFood.slug,
    summary: rawFood.short_description || rawFood.description || 'Fiche aliment importee depuis PocketBase.',
    imageUrl: resolveImageUrl('foods', rawFood.id, rawFood.image),
    calories: formatDecimal(rawFood.calories_per_100g),
    protein: formatDecimal(rawFood.protein_per_100g),
    carbs: formatDecimal(rawFood.carbs_per_100g),
    fat: formatDecimal(rawFood.fat_per_100g),
    fiber: formatDecimal(rawFood.fiber_per_100g),
    sodium: rawFood.sodium_per_100g === undefined || rawFood.sodium_per_100g === null ? null : formatDecimal(rawFood.sodium_per_100g),
    tags: buildFoodTags(rawFood, dietLabelMap, goalLabelMap),
    dietSlugs: relationSlugs(rawFood.diet_types, dietSlugMap),
    goalSlugs: relationSlugs(rawFood.nutrition_goals, goalSlugMap),
  };

  const dietNames = relationNames(rawFood.diet_types, dietLabelMap);
  const goalNames = relationNames(rawFood.nutrition_goals, goalLabelMap);
  const recipesPageData = getRecipesPageData();
  const ingredientRows = getRecipeIngredients()
    .filter((row) => row.food === rawFood.id)
    .map((row) => ({ recipe: row.recipe, food: row.food }));
  const relatedRecipeIds = new Set(ingredientRows.map((row) => row.recipe));
  const relatedRecipes = recipesPageData.recipes.filter((recipe) => relatedRecipeIds.has(recipe.id));

  const sponsoredLinks = getSponsoredLinks();
  const sponsoredLink =
    sponsoredLinks.find((item) => parseRelationList(item.foods).includes(rawFood.id)) ||
    sponsoredLinks.find((item) => parseRelationList(item.recipes).some((recipeId) => relatedRecipeIds.has(recipeId))) ||
    null;

  return {
    id: foodCard.id,
    name: foodCard.name,
    slug: foodCard.slug,
    summary: foodCard.summary,
    description: buildFoodDescription(rawFood, dietNames, goalNames),
    imageUrl: foodCard.imageUrl,
    calories: foodCard.calories,
    protein: foodCard.protein,
    carbs: foodCard.carbs,
    fat: foodCard.fat,
    fiber: foodCard.fiber,
    sodium: foodCard.sodium,
    tags: [...dietNames, ...goalNames].slice(0, 4),
    dietNames,
    goalNames,
    benefits: buildFoodBenefits(foodCard, dietNames, goalNames),
    usageTips: buildFoodUsageTips(foodCard),
    relatedRecipes,
    sponsoredLink,
  };
}

export function getDietDetailData(dietIdOrSlug: string): DietDetailData | null {
  const homeData = getHomePageData();
  const selectedDiet = homeData.dietTypes.find((diet) => diet.id === dietIdOrSlug || diet.slug === dietIdOrSlug);

  if (!selectedDiet) {
    return null;
  }

  const recipes = homeData.recipes.filter((recipe) => recipe.dietSlugs.includes(selectedDiet.slug));
  const foods = homeData.foods.filter((food) => food.dietSlugs.includes(selectedDiet.slug));

  return {
    id: selectedDiet.id,
    name: selectedDiet.name,
    slug: selectedDiet.slug,
    description: selectedDiet.description || 'Regime disponible dans votre base PocketBase.',
    icon: selectedDiet.icon || selectedDiet.name.slice(0, 2).toUpperCase(),
    recipeCount: recipes.length,
    foodCount: foods.length,
    recipes,
    foods,
  };
}

export function getRecipeDetailData(recipeIdOrSlug: string): RecipeDetailData | null {
  const dietTypes = getDietTypes();
  const nutritionGoals = getNutritionGoals();
  const recipes = getRecipes();
  const foods = getFoodsByName();
  const ingredientRows = getRecipeIngredients();
  const recipe = recipes.find((item) => item.id === recipeIdOrSlug || item.slug === recipeIdOrSlug);

  if (!recipe) {
    return null;
  }

  const dietLabelMap = new Map(dietTypes.map((dietType) => [dietType.id, dietType.name]));
  const goalLabelMap = new Map(nutritionGoals.map((goal) => [goal.id, goal.name]));
  const foodMap = new Map(foods.map((food) => [food.id, food]));
  const recipeIngredients = ingredientRows.filter((row) => row.recipe === recipe.id);
  const ingredients: RecipeIngredientDetail[] = recipeIngredients.map((ingredient) => {
    const food = foodMap.get(ingredient.food);
    const grams = food ? quantityToGrams(Number(ingredient.quantity || 0), ingredient.unit, food.name) : 0;

    return {
      id: ingredient.id,
      foodId: ingredient.food,
      foodName: food?.name || 'Ingredient',
      foodSlug: food?.slug || '',
      quantity: Number(ingredient.quantity || 0),
      unit: ingredient.unit,
      notes: ingredient.notes || '',
      grams,
      calories: food ? formatDecimal((Number(food.calories_per_100g || 0) * grams) / 100) : 0,
      protein: food ? formatDecimal((Number(food.protein_per_100g || 0) * grams) / 100) : 0,
      carbs: food ? formatDecimal((Number(food.carbs_per_100g || 0) * grams) / 100) : 0,
      fat: food ? formatDecimal((Number(food.fat_per_100g || 0) * grams) / 100) : 0,
    };
  });

  const baseServings = Math.max(1, Number(recipe.base_servings || 1));
  const totals = ingredients.reduce(
    (acc, ingredient) => ({
      calories: acc.calories + ingredient.calories,
      protein: acc.protein + ingredient.protein,
      carbs: acc.carbs + ingredient.carbs,
      fat: acc.fat + ingredient.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const estimatedTimes = estimateRecipeTimes(recipe.title, ingredients.length);
  const prepTime = Number(recipe.prep_time || 0) > 0 ? Number(recipe.prep_time || 0) : estimatedTimes.prepTime;
  const cookTime = Number(recipe.cook_time || 0) > 0 ? Number(recipe.cook_time || 0) : estimatedTimes.cookTime;
  const totalTime = prepTime + cookTime;
  const homeData = getHomePageData();
  const similarRecipes = homeData.recipes.filter((item) => {
    if (item.id === recipe.id) {
      return false;
    }

    const sharedDiet = parseRelationList(recipe.diet_types).some((dietId) => item.dietSlugs.includes(dietTypes.find((diet) => diet.id === dietId)?.slug || ''));
    const sharedGoal = parseRelationList(recipe.nutrition_goals).some((goalId) => item.goalSlugs.includes(nutritionGoals.find((goal) => goal.id === goalId)?.slug || ''));

    return sharedDiet || sharedGoal;
  }).slice(0, 3);
  const sponsoredLinks = getSponsoredLinks();
  const sponsoredLink =
    sponsoredLinks.find((item) => parseRelationList(item.recipes).includes(recipe.id)) ||
    sponsoredLinks.find((item) => parseRelationList(item.foods).some((foodId) => ingredients.some((ingredient) => ingredient.foodId === foodId))) ||
    null;

  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    summary: recipe.excerpt || 'Recette importee depuis PocketBase.',
    description: buildRecipeDescription(recipe, relationNames(recipe.diet_types, dietLabelMap), relationNames(recipe.nutrition_goals, goalLabelMap)),
    imageUrl: resolveImageUrl('recipes', recipe.id, recipe.image),
    baseServings,
    prepTime,
    cookTime,
    totalTime,
    caloriesPerServing: formatDecimal(totals.calories / baseServings),
    proteinPerServing: formatDecimal(totals.protein / baseServings),
    carbsPerServing: formatDecimal(totals.carbs / baseServings),
    fatPerServing: formatDecimal(totals.fat / baseServings),
    totalCalories: formatDecimal(totals.calories),
    totalProtein: formatDecimal(totals.protein),
    totalCarbs: formatDecimal(totals.carbs),
    totalFat: formatDecimal(totals.fat),
    ingredients,
    steps: buildRecipeSteps(recipe, ingredients),
    tags: [
      ...relationNames(recipe.diet_types, dietLabelMap),
      ...relationNames(recipe.nutrition_goals, goalLabelMap),
    ].slice(0, 4),
    dietNames: relationNames(recipe.diet_types, dietLabelMap),
    goalNames: relationNames(recipe.nutrition_goals, goalLabelMap),
    similarRecipes,
    sponsoredLink,
  };
}
