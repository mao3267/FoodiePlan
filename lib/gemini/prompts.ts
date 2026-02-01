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
- ingredients: array of { name: string, quantity: string, unit: string }
- instructions: string[]

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
- meals: array of { name: string, time: "Breakfast" | "Lunch" | "Dinner" | "Snack", servings: number, ingredients: array of { name: string, quantity: number, unit: string } }

Return ONLY valid JSON, no markdown or explanation.`;
}
