# Chef App

A React Native/Expo application that helps users manage their cooking ingredients, utensils, and preferences. Built with TypeScript, Supabase, and NativeWind.

## Features

- **User Authentication**: Secure login and registration with Supabase Auth
- **Onboarding Flow**: Guided setup for ingredients, utensils, and cooking preferences
- **Inventory Management**: Track ingredients with quantities and units
- **Kitchen Tools**: Manage your collection of cooking utensils
- **Personalization**: Set dietary preferences, cuisine tastes, and cooking habits
- **Recipe Integration**: (Coming soon) Connect ingredients to recipes

## Tech Stack

- **Framework**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **UI**: React Native with NativeWind (Tailwind CSS)
- **Database**: Supabase (PostgreSQL with Auth and Realtime)
- **State Management**: Zustand
- **Fonts**: Nunito via Expo Google Fonts

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- Supabase account

### Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
```

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

## Documentation

- [Development Guide](docs/DEVELOPMENT.md)
- [Component Library](docs/COMPONENT_LIBRARY.md)
- [State Management](docs/STATE_MANAGEMENT.md)
- [Supabase Integration](docs/SUPABASE_INTEGRATION.md)
- [Database Schema](docs/databse.md)

## Design System

The app uses an earth-tone color palette with the Nunito font family:

- **Colors**: Earth, Forest, Terracotta, Cream, and Sage tones
- **Typography**: Nunito Regular, Medium, SemiBold, and Bold
- **Spacing**: 4px grid system
- **Components**: Custom Button and Container components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to ensure code quality
5. Commit your changes
6. Push to the branch
7. Create a Pull Request

## License

This project is licensed under the MIT License.