# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start development server
expo start

# Start for specific platforms
expo start --android
expo start --ios
expo start --web
```

### Code Quality

```bash
# Run linting and formatting checks
npm run lint

# Fix linting/formatting issues
npm run format
```

## Project Structure

```
app/                    # App screens and routing
components/             # Reusable UI components
docs/                   # Documentation
store/                  # Zustand state management
utils/                  # Utility functions
theme.ts                # Design system tokens
tailwind.config.js      # Tailwind CSS configuration
```

## Architecture

- **Framework**: Expo Router with file-based routing
- **Language**: TypeScript in strict mode
- **UI**: React Native with NativeWind (Tailwind CSS)
- **Backend**: Supabase (PostgreSQL with Auth and Realtime)
- **State Management**: Zustand
- **Fonts**: Nunito via Expo Google Fonts

The app follows a feature-based structure where each major functionality (authentication, onboarding, inventory) is organized in its own directory under `app/`. The state management is handled by Zustand stores in the `store/` directory. UI components are reusable and located in `components/`.

## Documentation

- [Development Guide](docs/DEVELOPMENT.md)
- [Component Library](docs/COMPONENT_LIBRARY.md)
- [State Management](docs/STATE_MANAGEMENT.md)
- [Supabase Integration](docs/SUPABASE_INTEGRATION.md)
- [Database Schema](docs/databse.md)
