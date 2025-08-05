# Chef Project - Development Guidelines

## Commands
- `npm run lint` - ESLint & Prettier checks  
- `npm run format` - Fix linting/formatting
- `expo start` - Start dev server
- `expo start --android` - Android development
- `expo start --ios` - iOS development
- `expo start --web` - Web development

## Code Style

### Imports & TypeScript
- Use absolute imports with `~/*` alias
- Group: React → third-party → local components → utils
- Strict TypeScript only (no `any`)
- Functional components with hooks

### Styling
- **Font**: Nunito with explicit `fontFamily` styling
- **Colors**: earth-500, forest-600, terracotta-500, cream-50, sage-500 palette
- Use `className` with Tailwind CSS via NativeWind
- Always apply fontFamily to Text components

### React Patterns
- Define props interfaces with `TouchableOpacityProps` patterns
- Set displayName for forwardRef components
- Container components for SafeArea handling

### Error Handling
- try-catch for async operations
- Handle Supabase errors gracefully
- Loading states for async operations
- Alert for user-friendly error messages

### Architecture
- Expo Router file-based routing (app/)
- Zustand state management (store/)
- Supabase integration (utils/supabase.ts)
- Theme system (theme.ts)