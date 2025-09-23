# FoodiePlan
A web application to plan your meals and manage recipes. 
Learning backend development with Express.js and MongoDB.

## Tech Stack
- **Backend**
    - Express.js
    - MongoDB with Mongoose ODM
    - RESTful API
    - Node.js

## Current Implementation

### API Endpoints
**Recipes** (`/api/recipe`)
- `GET /` - Get all recipes
- `POST /` - Create a new recipe
- `GET /:id` - Get a single recipe
- `PATCH /:id` - Update a recipe
- `DELETE /:id` - Delete a recipe

**Ingredients** (`/api/ingredient`)
- `GET /` - Get all ingredients
- `POST /` - Create a new ingredient
- `GET /:id` - Get a single ingredient
- `PATCH /:id` - Update an ingredient
- `DELETE /:id` - Delete an ingredient

### Database Schema
**Recipe**
- `_id` - ObjectId
- `name` - String (required)
- `servings` - Number (required)
- `ingredients` - Array of ingredient objects with:
  - `ingredientId` - ObjectId reference to Ingredient
  - `name` - String
  - `quantity` - Number
  - `unit` - String
- `createdAt`, `updatedAt` - Timestamps

**Ingredient**
- `_id` - ObjectId
- `name` - String (required)
- `quantity` - Number (required)
- `unit` - String (required)
- `usedInRecipes` - Array of ObjectId references to Recipe
- `createdAt`, `updatedAt` - Timestamps


