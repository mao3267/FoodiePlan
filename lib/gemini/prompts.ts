export function recipeSuggestionPrompt(
  ingredients: string[],
  preferences?: string
): string {
  const ingredientList = ingredients.join(", ");
  return `You are a helpful chef assistant. Suggest 3 recipes using these ingredients: ${ingredientList}.
${preferences ? `Dietary preferences: ${preferences}` : ""}

Return a JSON array of recipes, each with:
- name: string
- servings: number
- prepTime: string
- ingredients: array of { name: string, quantity: string, unit: string } (main food items: proteins, vegetables, grains, dairy, etc.)
- seasonings: array of { name: string, quantity: string, unit: string } (oils, sauces, spices, herbs, condiments)
- instructions: string[]

List items at the level of things you'd buy at a supermarket. Use high-level purchasable products (e.g., "tortillas", "pasta", "bread") instead of their raw sub-ingredients (e.g., "flour", "yeast", "baking powder"). Only list base ingredients when they are commonly purchased on their own (e.g., "eggs", "butter", "garlic").

Return ONLY valid JSON, no markdown or explanation.`;
}

export function mealPlanPrompt(options: {
  days: number;
  preferences: Record<string, string>;
  servings: number;
}): string {
  const prefStr = Object.entries(options.preferences)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  return `You are a meal planning assistant. Generate a ${options.days}-day meal plan for ${options.servings} servings.
${prefStr ? `Preferences: ${prefStr}` : ""}

Return a JSON array of day objects, each with:
- day: string (e.g., "Monday")
- meals: array of { name: string, time: "Breakfast" | "Lunch" | "Dinner" | "Snack", servings: number, ingredients: array of { name: string, quantity: number, unit: string }, seasonings: array of { name: string, quantity: number, unit: string } }

Split each meal's items into "ingredients" (main food items: proteins, vegetables, grains, dairy, etc.) and "seasonings" (oils, sauces, spices, herbs, condiments).

List items at the level of things you'd buy at a supermarket. Use high-level purchasable products (e.g., "tortillas", "pasta", "bread") instead of their raw sub-ingredients (e.g., "flour", "yeast", "baking powder"). Only list base ingredients when they are commonly purchased on their own (e.g., "eggs", "butter", "garlic").

Return ONLY valid JSON, no markdown or explanation.`;
}
