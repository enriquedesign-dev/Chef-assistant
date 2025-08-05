# Component Library Documentation

## Overview

The Chef app includes a small but growing component library following the earth-tone design system. All components use NativeWind (Tailwind CSS for React Native) and explicitly set font families for consistent typography.

## Available Components

### Container (`components/Container.tsx`)

A wrapper component that ensures proper SafeArea handling across all devices. All screens should wrap their content with this component.

**Usage:**
```typescript
<Container>
  <Stack.Screen options={{ title: 'Screen Title', headerShown: false }} />
  <View className="flex-1 bg-cream-50">
    {/* Screen content */}
  </View>
</Container>
```

**Props:**
- `children`: React nodes to render within the safe area

**Key Features:**
- Uses `SafeAreaView` for proper device inset handling
- Full flex-1 layout for consistent sizing
- Background color set to cream-50 (primary background)

### Button (`components/Button.tsx`)

A customizable button component with consistent styling following the design system.

**Usage:**
```typescript
<Button 
  title="Continue" 
  onPress={handlePress}
  disabled={isDisabled}
/>
```

**Props:**
- `title`: Button text (required)
- `onPress`: Press handler (required)
- `disabled`: Disable state (optional)
- `className`: Additional styling (optional)

**Key Features:**
- Forward ref support for accessibility
- Disabled state styling
- Consistent indigo background with white text
- Rounded corners and shadow effects
- Explicit Nunito_600SemiBold font

### ScreenContent (`components/ScreenContent.tsx`)

A template component for consistent screen layouts, though currently minimal.

### EditScreenInfo (`components/EditScreenInfo.tsx`)

A utility component for development/debugging information display.

## Design System Implementation

### Colors
All components use the earth-tone color palette:
- Primary background: `bg-cream-50`
- Text colors: `text-earth-800`, `text-earth-600`
- Action colors: `bg-forest-500`, `bg-terracotta-500`

### Typography
Explicit font family styling using Nunito:
- Headers: `Nunito_700Bold`
- Buttons/Labels: `Nunito_600SemiBold`
- Body text: `Nunito_400Regular` or `Nunito_500Medium`

### Spacing
Consistent spacing using Tailwind's 4px grid:
- Padding: `px-6`, `py-4`, `p-4`
- Margins: `mb-6`, `mt-4`, `m-2`

## Component Development Guidelines

### New Component Checklist
1. Use NativeWind classes for styling
2. Implement explicit font family for all Text components
3. Follow the earth-tone color palette
4. Use TypeScript interfaces for props
5. Implement accessibility features
6. Add forwardRef support for interactive components

### Styling Patterns
```typescript
// Good - Using NativeWind classes
<View className="flex-1 bg-cream-50 p-6">

// Good - Explicit font styling
<Text style={{ fontFamily: 'Nunito_600SemiBold' }}>

// Avoid - Inline styles
<View style={{ backgroundColor: '#faf9f7', padding: 24 }}>
```

### Type Safety
All components should use strict TypeScript interfaces:
```typescript
interface ButtonProps extends TouchableOpacityProps {
  title: string;
}

const Button = forwardRef<TouchableOpacity, ButtonProps>(({ title, ...props }, ref) => {
  // Implementation
});
Button.displayName = 'Button';
```

This ensures proper autocomplete and type checking while maintaining the forwardRef pattern.

## Future Component Library Expansion

Consider adding these reusable components:
1. Form inputs with validation
2. Cards for recipes/ingredients
3. Navigation headers
4. Loading indicators
5. Error message displays