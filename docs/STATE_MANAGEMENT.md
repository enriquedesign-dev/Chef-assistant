# State Management Documentation

## Overview

The Chef app uses Zustand for state management, currently with a minimal implementation that serves as a pattern for expansion.

## Current Implementation

### Bear Store (`store/store.ts`)

```typescript
interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}
```

This basic store demonstrates:
- State definition with TypeScript interfaces
- Action creators for state mutations
- Store initialization with `create<BearState>()`

## Expansion Guidelines

### 1. Store Structure

For new features, create focused state slices:

```typescript
// Example onboarding slice
interface OnboardingState {
  currentStep: number;
  completedSteps: string[];
  setStep: (step: number) => void;
  markStepComplete: (step: string) => void;
}

// Example auth slice
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}
```

### 2. Store Combination

Combine multiple slices in the main store:

```typescript
const useStore = create<BearState & OnboardingState & AuthState>()(
  combine(
    bearSlice,
    onboardingSlice,
    authSlice
  )
);
```

### 3. Async Operations

Use async/await in actions for API calls:

```typescript
const authSlice = (set) => ({
  user: null,
  login: async (credentials) => {
    const user = await authenticate(credentials);
    set({ user });
  }
})
```

### 4. Middleware

Consider middleware for advanced features:

```typescript
const useStore = create(
  persist(
    (set, get) => ({
      // state and actions
    }),
    {
      name: 'chef-storage',
      partialize: (state) => ({ 
        // only persist specific parts
      })
    }
  )
)
```

## Best Practices

1. Keep state slices focused and cohesive
2. Use TypeScript interfaces for all state structures
3. Implement proper error handling in async actions
4. Consider performance implications of large state objects
5. Use middleware sparingly and only when necessary
6. Test state changes with unit tests

## Integration Patterns

### With React Components

```typescript
// Select specific state to avoid unnecessary re-renders
const bears = useStore((state) => state.bears);
const increasePopulation = useStore((state) => state.increasePopulation);
```

### With Supabase

```typescript
const loadUserData = async () => {
  const { data } = await supabase.from('profiles').select('*');
  setUserData(data);
}
```

This pattern ensures proper separation of concerns between data fetching (Supabase) and state management (Zustand).