# Chef App - Development Documentation

## Project Overview

Chef App is a React Native/Expo application built with TypeScript that helps users manage their cooking ingredients, utensils, and preferences. It features a complete authentication system, user onboarding, and personalized cooking experience powered by Supabase.

## Current Status ✅

**Completed Features:**
- ✅ User Authentication (Login/Register)
- ✅ Onboarding Flow (Ingredients → Utensils → Preferences)
- ✅ Database Integration with Supabase
- ✅ Row Level Security (RLS) Implementation
- ✅ Custom Design System with Earth-tone Color Palette
- � Comprehensive Error Handling
- ✅ TypeScript throughout the codebase

## Tech Stack

### Core Technologies
- **Framework**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode enabled)
- **UI Library**: React Native with NativeWind (Tailwind CSS for React Native)
- **Database**: Supabase (PostgreSQL with Auth and Realtime)
- **State Management**: Zustand (currently minimal usage)

### Development Tools
- **Bundler**: Metro with NativeWind integration
- **Linting**: ESLint with Expo configuration
- **Formatting**: Prettier with Tailwind plugin
- **Navigation**: Expo Router Stack navigation

## Project Architecture

### File Structure
```
app/
├── _layout.tsx              # Root layout with font loading
├── +html.tsx               # HTML fallback for web
├── +not-found.tsx          # 404 error handler
├── index.tsx               # Home/Landing screen
├── login.tsx               # User login
├── register.tsx            # User registration
├── debug.tsx               # Debug/temporary auth status
└── onboarding/             # Onboarding flow
    ├── ingredients.tsx     # Ingredient inventory setup
    ├── utensils.tsx        # Utensil inventory setup
    └── tastes.tsx          # User preferences (diet, cuisine, etc.)

components/
└── Container.tsx           # SafeArea wrapper component

store/
└── store.ts                # Zustand state management

utils/
└── supabase.ts             # Supabase client configuration

docs/
├── databse.md              # Database schema and API documentation
└── requirements/           # Feature requirements
    ├── onboarding.md       # Onboarding specifications
    └── login_register-implementation.md  # Auth implementation details
```

### Design Patterns

#### 1. Container Component Pattern
```typescript
<Container>
  <Stack.Screen options={{ title: 'Screen Name', headerShown: false }} />
  <View className="flex-1 bg-cream-50">
    {/* Screen content */}
  </View>
</Container>
```
- **Purpose**: Ensures consistent SafeArea handling across all screens
- **Benefits**: Automatic device notch/status bar padding, full-screen layout
- **Implementation**: Uses SafeAreaView with `flex-1` className

#### 2. Screen Navigation Pattern
```typescript
export default function ScreenName() {
  const router = useRouter();
  
  return (
    <Container>
      <Stack.Screen options={{ title: 'Screen Name', headerShown: false }} />
      {/* Back header with custom styling */}
      <View className="mb-8 flex-row items-center px-6 pb-4 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-2xl text-earth-600">
            ←
          </Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-2xl text-earth-800">
          Screen Title
        </Text>
      </View>
    </Container>
  );
}
```

#### 3. Authentication Flow Pattern
```typescript
// User registration with proper display name handling
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

// Login with onboarding status check
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_complete) {
    router.push('/debug');
  } else {
    router.push('/onboarding/ingredients');
  }
}
```

#### 4. Form Validation Pattern
```typescript
const handleSubmit = async () => {
  // Client-side validation
  if (!field1 || !field2) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  setLoading(true);
  try {
    // API call with error handling
    const { error } = await apiCall();
    if (error) {
      Alert.alert('Operation Failed', error.message);
    } else {
      // Success handling
      Alert.alert('Success', 'Operation completed');
      router.push('/next-screen');
    }
  } catch {
    Alert.alert('Error', 'An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
```

#### 5. Modal CRUD Pattern (Ingredients/Utensils)
```typescript
// State management for modals
const [modalVisible, setModalVisible] = useState(false);
const [editingItem, setEditingItem] = useState<Item | null>(null);

// Upsert operation with unique constraint handling
const result = editingItem 
  ? await supabase.from('table').update(data).eq('id', editingItem.id)
  : await supabase.from('table').insert(data);

// Error handling for unique constraints
if (result.error?.code === '23505') {
  Alert.alert('Duplicate Item', 'Item already exists');
}
```

### Design System

#### Colors (Earth-tone Palette)
```typescript
// Primary Colors
background: '#faf9f7'    // cream-50
earth: {
  500: '#9a7e5a',       // Primary action buttons
  600: '#826445',       // Headers, important text
  800: '#292524',       // Primary text
}
forest: {
  500: '#5aa85a',       // Success states, secondary actions
  600: '#428f42',
}
terracotta: {
  500: '#cc5832',       // Destructive actions, warnings
}
sage: {
  300: '#dde5e8',       // Input borders
  500: '#7a98a3',       // Alternative buttons
}
```

#### Typography System
```typescript
// Font: Nunito with explicit styling
<Text style={{ fontFamily: 'Nunito_700Bold' }}>     // Headings
<Text style={{ fontFamily: 'Nunito_600SemiBold' }}>  // Subheadings, Buttons
<Text style={{ fontFamily: 'Nunito_500Medium' }}>    // Labels, Captions
<Text style={{ fontFamily: 'Nunito_400Regular' }}>   // Body text
```

#### Spacing System
```typescript
// Base spacing unit: 4px (0.25rem)
px-6    // 24px horizontal padding
py-4    // 16px vertical padding
mb-6    // 24px margin bottom
pt-12   // 48px padding top (for headers)
```

## Authentication Implementation

### User Registration Flow
1. **Form Validation**: Client-side validation for all fields, password matching, minimum length
2. **Supabase Auth**: Creates user account with `full_name` and `display_name` metadata
3. **Database Trigger**: Automatically creates profile record (trigger-based, no manual update)
4. **Success Handling**: Shows confirmation, signs out user, redirects to login

### User Login Flow
1. **Authentication**: Signs in with email/password
2. **Profile Check**: Retrieves onboarding status from profiles table
3. **Redirect Logic**: 
   - `onboarding_complete = true` → Debug screen
   - `onboarding_complete = false` → Onboarding ingredients screen

### Security Features
- **Row Level Security (RLS)**: Enabled on all tables, users can only access their own data
- **Environment Variables**: Supabase credentials properly configured and validated
- **Session Management**: Automatic token refresh, persistent sessions with AsyncStorage

## Onboarding Flow

### 1. Ingredients Screen (`/onboarding/ingredients`)
- **Purpose**: Set up user's ingredient inventory
- **Requirements**: Minimum 3 ingredients to continue
- **Features**:
  - Add/Edit/Delete ingredients with name, quantity, unit
  - Unit selection from predefined list (g, kg, ml, cups, tbsp, etc.)
  - Real-time database sync with unique constraints
  - Progress indicator (continue button disabled until 3 items)

### 2. Utensils Screen (`/onboarding/utensils`)
- **Purpose**: Set up user's kitchen utensils
- **Requirements**: Minimum 1 utensil to continue
- **Features**:
  - Add/Edit/Delete utensils by name
  - Pre-loaded defaults: spoon, fork, knife, plates
  - Simpler interface (no quantity/unit)

### 3. Tastes/Preferences Screen (`/onboarding/tastes`)
- **Purpose**: Set up user's cooking preferences
- **Requirements**: All fields must be completed
- **Features**:
  - **Diet Selection**: Multiple diets + custom options
  - **Cuisine Preferences**: Multiple cuisines + custom options
  - **Difficulty**: Single selection (Easy/Medium/Hard)
  - **Cooking Time**: Duration preference (15-120 mins)
  - **Portions**: Serving size preference (1-8 people)

### Onboarding Completion
1. **Data Persistence**: All preferences saved to `user_preferences` table
2. **Status Update**: `onboarding_complete` flag set to `true` in profile
3. **Redirect**: User sent to debug screen

## Database Schema & API

### Core Tables

#### `profiles`
- Links to `auth.users` via foreign key
- Contains `full_name`, `onboarding_complete` status
- Auto-created by database trigger on user signup

#### `ingredients`
- User's ingredient inventory
- Fields: `name`, `quantity`, `unit`
- Unique constraint: `(user_id, name)`
- RLS enabled: Users only see their ingredients

#### `utensils`
- User's kitchen utensils
- Fields: `name` only
- Unique constraint: `(user_id, name)`
- RLS enabled

#### `user_preferences`
- User's cooking preferences
- Fields: `diet`, `tastes[]`, `preferred_difficulty`, `preferred_time_minutes`, `preferred_portions`
- One-to-one relationship with user

### Key Patterns

#### Universal Pattern: User Context + RLS
```typescript
// All database operations leverage RLS automatically
const { data } = await supabase
  .from('table')
  .select('*');
// No need for .eq('user_id', userId) - RLS handles it!
```

#### Upsert Pattern for Unique Constraints
```typescript
// Works with (user_id, name) unique constraints
const { data, error } = await supabase
  .from('ingredients')
  .upsert({ name: 'Flour', quantity: 500, unit: 'g' });
```

#### Error Handling Pattern
```typescript
// Specific error code handling
if (error.code === '23505') {
  Alert.alert('Duplicate', 'Item already exists');
} else {
  Alert.alert('Error', 'Operation failed');
}
```

## Development Environment

### Commands
```bash
npm run lint        # ESLint + Prettier checks
npm run format      # Fix linting/formatting issues
expo start          # Start development server
expo start --web    # Web development
expo start --ios    # iOS development  
expo start --android # Android development
```

### Additional Documentation
- `docs/STATE_MANAGEMENT.md` - Zustand patterns and expansion guidelines
- `docs/COMPONENT_LIBRARY.md` - Reusable UI components and design system implementation
- `docs/SUPABASE_INTEGRATION.md` - Authentication, database operations, and security patterns

### Code Standards
- **TypeScript**: Strict mode, no `any` types
- **Imports**: Absolute paths with `~/*` alias
- **Formatting**: 100 char width, 2 spaces, single quotes
- **Linting**: Expo config with react/display-name disabled
- **Tailwind**: Classes sorted automatically via plugin

### Environment Setup
1. **Environment Variables Required**:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

2. **Font Loading**: Nunito font family loaded in `_layout.tsx`
3. **Database Connection**: Supabase client configured with AsyncStorage for session persistence

## Known Issues & Future Considerations

### Current Limitations
- **Debug Screen**: Temporary screen showing user data (should become dashboard)
- **Zustand Store**: Currently minimal (bear counter pattern), needs expansion
- **Navigation**: Basic stack navigation, no tab navigation yet
- **Error Boundaries**: Not implemented yet
- **Testing**: No automated tests (manual testing only)

### Potential Improvements
- **Offline Support**: Add database persistence for offline usage
- **Real-time Updates**: Implement Supabase Realtime for instant sync
- **Advanced Forms**: Form libraries like React Hook Form for better validation
- **Performance**: Implement React.memo, useMemo, useCallback where needed
- **Animation**: Add Lottie animations for better UX
- **Push Notifications**: Implement for recipe suggestions

## Development Guidelines for New Features

### Adding New Screens
1. Follow the Container Component pattern
2. Use consistent header styling with back navigation
3. Implement proper loading states and error handling
4. Use the established design system (colors, typography, spacing)
5. Add TypeScript interfaces for all data structures

### Database Changes
1. Always consider RLS policies for new tables
2. Use appropriate constraint types (unique, foreign key)
3. Consider the automatic profile creation trigger
4. Test with both new and existing users

### Styling New Components
1. Use the earth-tone color palette from theme.ts
2. Apply Nunito font family with explicit fontFamily styling
3. Follow spacing patterns based on 4px grid
4. Use consistent border radius (rounded-lg for most components)
5. Ensure proper accessibility (color contrast, touch target sizes)

### Authentication Extensions
1. Never manually update profiles during registration (use triggers)
2. Always set both `full_name` and `display_name` in user metadata
3. Check onboarding status before dashboard access
4. Handle session expiration gracefully

This documentation provides a comprehensive overview of the current Chef App implementation, making it easy for new developers to understand the codebase architecture, patterns, and conventions.