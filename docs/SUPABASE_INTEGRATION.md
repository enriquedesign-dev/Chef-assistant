# Supabase Integration Guide

## Overview

The Chef app integrates with Supabase for authentication, database operations, and real-time features. The integration emphasizes security through Row Level Security (RLS) and follows best practices for client-side data management.

## Client Configuration

### Initialization (`utils/supabase.ts`)

The Supabase client is configured with environment variables and AsyncStorage for session persistence:

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Environment Variables

Required environment variables in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Authentication Patterns

### User Registration

Registration follows a secure pattern with automatic profile creation:

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      display_name: name,
    },
  },
});
```

**Key Points:**
- Profile records are automatically created via database triggers
- Both `full_name` and `display_name` are set in user metadata
- No manual profile insertion needed after registration

### User Login

Login includes onboarding status check for proper routing:

```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// After successful login
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarding_complete')
  .eq('id', user?.id)
  .single();
```

### Session Management

The client automatically handles:
- Token refresh with `autoRefreshToken: true`
- Session persistence with `persistSession: true`
- AsyncStorage integration for cross-app restart persistence

## Database Operations

### Row Level Security (RLS)

All user data tables implement RLS policies that automatically filter data by `user_id`. This means queries don't need explicit user filtering:

```typescript
// No need to filter by user_id - RLS handles it automatically
const { data } = await supabase
  .from('ingredients')
  .select('*');
```

### Upsert Pattern for Unique Constraints

Use `upsert` for create/update operations with unique constraints:

```typescript
const { data, error } = await supabase
  .from('ingredients')
  .upsert({ 
    name: 'Flour', 
    quantity: 500, 
    unit: 'g' 
  })
  .select();
```

This pattern works with the `(user_id, name)` unique constraint on ingredients/utensils tables.

### Error Handling

Handle specific database errors for better UX:

```typescript
try {
  const { error } = await supabase.operation();
  if (error) {
    if (error.code === '23505') {
      Alert.alert('Duplicate Item', 'This item already exists');
    } else {
      Alert.alert('Error', error.message);
    }
  }
} catch (e) {
  Alert.alert('Network Error', 'Please check your connection');
}
```

## Real-time Features

### Future Implementation

The Supabase client supports real-time subscriptions that can be implemented for:
- Instant ingredient/utensil updates across devices
- Collaborative recipe editing
- Notification systems

Basic pattern:
```typescript
const subscription = supabase
  .channel('changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'ingredients',
    },
    (payload) => {
      console.log('New ingredient:', payload.new);
    }
  )
  .subscribe();
```

## Database Functions (RPC)

### Cook Action

Use database functions for complex operations that require transaction safety:

```typescript
const { data, error } = await supabase.rpc('select_recipe_and_subtract_ingredients', {
  recipe_id_to_use: recipeId
});
```

This ensures atomic operations that either fully succeed or completely fail.

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use Expo's `EXPO_PUBLIC_` prefix for client-safe variables
- Keep sensitive keys server-side only

### 2. RLS Policies
- All user data tables must have RLS enabled
- Policies should restrict access to `user_id = auth.uid()`
- Regular policy audits for security compliance

### 3. Error Handling
- Never expose raw database errors to users
- Log sensitive errors server-side only
- Implement rate limiting for authentication attempts

### 4. Data Validation
- Validate data client-side for UX
- Implement database constraints for security
- Use specific column selection instead of `select('*')` when possible

## Migration and Schema Updates

### Local Development
1. Use Supabase local development CLI
2. Test RLS policies with `supabase status`
3. Export schema changes with `supabase db pull`

### Production Deployment
1. Use Supabase dashboard for SQL migrations
2. Test in staging environment first
3. Monitor for RLS policy violations
4. Update client code for schema changes

## Performance Considerations

### Query Optimization
- Use selective column fetching instead of `select('*')` when possible
- Implement proper indexing on frequently queried columns
- Use pagination for large datasets

### Connection Management
- Reuse the singleton client instance
- Handle network interruptions gracefully
- Implement retry logic for critical operations

This integration guide ensures secure, efficient, and maintainable Supabase usage throughout the Chef application.