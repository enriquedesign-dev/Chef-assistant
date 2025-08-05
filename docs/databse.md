# App Database Developer Documentation

Welcome to the project\! This document outlines the structure of our Supabase database, how to interact with it from the client application, and the core logic you'll need to work with.

## 1\. Core Architecture

Our database follows a **user-centric** model. This means that nearly every piece of data (ingredients, recipes, etc.) is directly associated with a `user_id`.

**Key Principles:**

  * **Row Level Security (RLS) is Enforced:** A user can *only* see and modify their own data. The database policies handle this automatically. You don't need to write `where('user_id', 'eq', userId)` in every query, but it's good practice for clarity.
  * **User Profiles are Handled Automatically:** When a new user signs up via Supabase Auth, a trigger automatically creates a corresponding entry in the `profiles` table.
  * **Flexible Recipe Ingredients:** Recipe ingredients are stored in a `JSONB` column. This allows us to save a complete recipe object in a single operation.

-----

## 2\. User Authentication & Profiles

The `profiles` table stores public-facing data and app-specific settings for a user.

### Fetching a User's Profile

To get the profile information for the currently logged-in user, query the `profiles` table. Since RLS is active, this will automatically return only the correct profile.

```javascript
async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user logged in');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single(); // Use .single() as we expect only one row

  if (error) {
    console.error('Error fetching profile:', error);
  }

  return data;
}
```

-----

## 3\. Managing User Inventory (`ingredients`, `utensils`)

A user's inventory is stored in the `ingredients` and `utensils` tables.

### Fetching All Ingredients for a User

```javascript
async function getUserIngredients() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('id, name, quantity, unit');

  if (error) {
    console.error('Error fetching ingredients:', error);
  }

  return data || [];
}
```

### Adding or Updating an Ingredient

The `upsert` operation is perfect for this. Thanks to the `unique_ingredient_for_user` constraint on `(user_id, name)`, `upsert` will create a new ingredient if the name doesn't exist for that user, or update the existing one if it does.

```javascript
async function addOrUpdateIngredient(ingredient) {
  // ingredient should be an object like:
  // { name: 'Flour', quantity: 500, unit: 'g' }

  const { data, error } = await supabase
    .from('ingredients')
    .upsert(ingredient)
    .select();

  if (error) {
    console.error('Error upserting ingredient:', error);
  }
  return data;
}
```

-----

## 4\. Working with Recipes

Recipes are the core of the app. The most important column is `ingredients`, which is of type `JSONB`.

### The `ingredients` JSONB Structure

When creating or updating a recipe, the `ingredients` field **must** be an array of objects with the following structure:

`[ { "name": "Flour", "quantity": 500, "unit": "g" }, { "name": "Sugar", "quantity": 200, "unit": "g" } ]`

### Creating a New Recipe

```javascript
async function createRecipe(recipeData) {
  // recipeData is an object like:
  // {
  //   title: 'Simple Pancakes',
  //   description: 'Classic fluffy pancakes.',
  //   instructions: ['Mix dry ingredients.', 'Add wet ingredients.', 'Cook on griddle.'],
  //   servings: 4,
  //   ingredients: [
  //     { name: 'Flour', quantity: 1.5, unit: 'cup' },
  //     { name: 'Sugar', quantity: 1, unit: 'tbsp' }
  //   ]
  // }

  const { data, error } = await supabase
    .from('recipes')
    .insert(recipeData)
    .select();

  if (error) {
    console.error('Error creating recipe:', error);
  }

  return data;
}
```

-----

## 5\. The "Cook" Action: Using the Database Function (RPC)

To subtract a recipe's ingredients from a user's inventory, you **must** use the `select_recipe_and_subtract_ingredients` database function. Do not try to implement this logic on the client.

This function performs an **atomic transaction**: it either fully succeeds or completely fails, preventing data corruption (like only subtracting half the ingredients).

### How to Call the RPC

You call it using `supabase.rpc()`. You pass the function name and its arguments.

```javascript
async function cookRecipe(recipeId) {
  const { data, error } = await supabase.rpc('select_recipe_and_subtract_ingredients', {
    recipe_id_to_use: recipeId
  });

  if (error) {
    // This could be a database-level error
    console.error('RPC Error:', error);
    alert('An unexpected error occurred.');
    return;
  }

  // The 'data' variable holds the text returned by the function
  if (data.startsWith('Success')) {
    console.log(data); // "Success: Ingredients have been subtracted."
    alert('Enjoy your meal! Ingredients updated.');
    // You should re-fetch the user's ingredients here to update the UI
  } else {
    console.warn(data); // e.g., "Error: Insufficient ingredient - Flour"
    alert(data); // Show the specific error to the user
  }
}
```

-----

## 6\. Data Models & Types Reference

For developers using TypeScript or just for reference.

**Enums:**

  * `chef_level_enum`: `'Beginner'`, `'Intermediate'`, `'Advanced'`
  * `difficulty_enum`: `'Easy'`, `'Medium'`, `'Hard'`

---
## `profiles`
This table stores public and app-specific information for each user, linking directly to Supabase's authentication system.

| Column Name | Data Type | Description/Constraints |
| :--- | :--- | :--- |
| **id** | `uuid` | **Primary Key**, Foreign Key to `auth.users.id` |
| updated\_at | `timestamptz` | When the profile was last updated |
| full\_name | `text` | The user's full name |
| avatar\_url | `text` | URL for the user's profile picture |
| onboarding\_complete| `boolean` | `true` if the user has finished the onboarding flow |

---
## `ingredients`
This table holds the inventory of ingredients for each specific user.

| Column Name | Data Type | Description/Constraints |
| :--- | :--- | :--- |
| **id** | `bigint` | **Primary Key** |
| user\_id | `uuid` | Foreign Key to `profiles.id` |
| name | `text` | Name of the ingredient (e.g., "Flour") |
| quantity | `numeric` | Amount of the ingredient (e.g., 500) |
| unit | `text` | Unit of measurement (e.g., "g") |
| created\_at | `timestamptz` | When the ingredient was added |
| *constraint* | | `unique_ingredient_for_user` on `(user_id, name)` |

---
## `utensils`
This table stores the kitchen utensils each user possesses.

| Column Name | Data Type | Description/Constraints |
| :--- | :--- | :--- |
| **id** | `bigint` | **Primary Key** |
| user\_id | `uuid` | Foreign Key to `profiles.id` |
| name | `text` | Name of the utensil (e.g., "Spatula") |
| created\_at | `timestamptz` | When the utensil was added |
| *constraint* | | `unique_utensil_for_user` on `(user_id, name)` |

---
## `user_preferences`
This table stores a user's specific settings and preferences for recipe generation.

| Column Name | Data Type | Description/Constraints |
| :--- | :--- | :--- |
| **id** | `uuid` | **Primary Key**, Foreign Key to `profiles.id` |
| updated\_at | `timestamptz` | When the preferences were last updated |
| diet | `text` | User's dietary preference (e.g., "Vegan") |
| tastes | `text[]` | An array of preferred cuisines (e.g., `{'Italian', 'Mexican'}`) |
| preferred\_difficulty| `difficulty_enum` | Can be `'Easy'`, `'Medium'`, or `'Hard'` |
| preferred\_time\_minutes | `integer`| Preferred total cooking time in minutes |
| preferred\_portions| `integer` | Preferred number of portions |

---
## `recipes`
This table stores the recipes users have saved. The ingredients are embedded within each recipe record.

| Column Name | Data Type | Description/Constraints |
| :--- | :--- | :--- |
| **id** | `bigint` | **Primary Key** |
| user\_id | `uuid` | Foreign Key to `profiles.id` |
| title | `text` | The title of the recipe |
| description | `text` | A brief description of the recipe |
| ingredients | `jsonb` | A JSON array of ingredient objects |
| instructions | `text[]` | An array of steps for the recipe |
| prep\_time\_minutes| `integer` | Preparation time in minutes |
| cook\_time\_minutes| `integer` | Cooking time in minutes |
| servings | `integer` | How many servings the recipe makes |
| image\_url | `text` | URL for a photo of the dish |
| is\_used | `boolean` | `true` if ingredients have been subtracted |
| created\_at | `timestamptz` | When the recipe was saved |
