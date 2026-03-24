import type { APIRoute } from 'astro';

const PB_URL = (import.meta.env.PB_URL || import.meta.env.PUBLIC_PB_URL || '').replace(/\/$/, '');

function getToken(request: Request) {
  const raw = request.headers.get('authorization') || '';
  return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
}

async function verifySuperuserToken(token: string) {
  if (!PB_URL || !token) {
    return false;
  }

  const response = await fetch(`${PB_URL}/api/collections/_superusers/auth-refresh`, {
    method: 'POST',
    headers: {
      Authorization: token,
    },
  });

  return response.ok;
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || 'Reponse PocketBase invalide.' };
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (!PB_URL) {
    return new Response(JSON.stringify({ message: 'PB_URL manquant.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = getToken(request);
  const isAllowed = await verifySuperuserToken(token);

  if (!isAllowed) {
    return new Response(JSON.stringify({ message: 'Session admin invalide.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const incoming = await request.formData();
  const recipePayload = new FormData();

  for (const field of [
    'title',
    'slug',
    'excerpt',
    'content',
    'base_servings',
    'prep_time',
    'cook_time',
  ]) {
    const value = incoming.get(field);
    if (typeof value === 'string' && value !== '') {
      recipePayload.append(field, value);
    }
  }

  for (const relationField of ['diet_types', 'nutrition_goals']) {
    for (const value of incoming.getAll(relationField)) {
      if (typeof value === 'string' && value !== '') {
        recipePayload.append(relationField, value);
      }
    }
  }

  const image = incoming.get('image');
  if (image instanceof File && image.size > 0) {
    recipePayload.append('image', image);
  }

  const recipeResponse = await fetch(`${PB_URL}/api/collections/recipes/records`, {
    method: 'POST',
    headers: {
      Authorization: token,
    },
    body: recipePayload,
  });
  const createdRecipe = await parseJsonResponse(recipeResponse);

  if (!recipeResponse.ok) {
    return new Response(JSON.stringify(createdRecipe), {
      status: recipeResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ingredientsRaw = incoming.get('ingredients');
  let ingredients: Array<{ food: string; quantity: number; unit: string; notes?: string }> = [];

  if (typeof ingredientsRaw === 'string' && ingredientsRaw) {
    try {
      ingredients = JSON.parse(ingredientsRaw);
    } catch {
      return new Response(JSON.stringify({ message: 'Ingredients invalides.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  for (const ingredient of ingredients) {
    const ingredientResponse = await fetch(`${PB_URL}/api/collections/recipe_ingredients/records`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipe: createdRecipe.id,
        food: ingredient.food,
        quantity: Number(ingredient.quantity || 0),
        unit: ingredient.unit,
        notes: ingredient.notes || '',
      }),
    });

    if (!ingredientResponse.ok) {
      const ingredientPayload = await parseJsonResponse(ingredientResponse);

      return new Response(
        JSON.stringify({
          message: 'Recette creee mais ajout des ingredients impossible.',
          recipe: createdRecipe,
          ingredientError: ingredientPayload,
        }),
        {
          status: ingredientResponse.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  return new Response(
    JSON.stringify({
      recipe: createdRecipe,
      ingredientsCount: ingredients.length,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
