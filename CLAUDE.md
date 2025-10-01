# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Router v7 application implementing an infinite scroll demo with virtual list functionality. The project uses React Router's data loading patterns with SSR support and modern React features.

## Commands

### Development
```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run start    # Start production server (serves built app)
npm run typecheck # Run TypeScript type checking
```

### Key Dependencies
- **React Router v7**: Full-stack web framework with file-based routing
- **@tanstack/react-virtual**: Virtual scrolling for performance
- **react-intersection-observer**: Intersection Observer API for React
- **TypeScript**: Type safety throughout the codebase

## Architecture

### React Router v7 Structure
The application follows React Router v7's conventions:
- **File-based routing**: Routes defined by file structure in `app/routes/`
- **Data loading**: Server-side data fetching via `loader` functions
- **Actions**: Form submissions handled via `action` functions
- **Type-safe routing**: Route parameters and data are fully typed

### Key Architectural Patterns

1. **Virtual Scrolling Implementation** (`app/routes/home.tsx`)
   - Uses `@tanstack/react-virtual` for efficient rendering of large lists
   - Implements dynamic loading with page-based data fetching
   - Custom hooks for managing virtual list state

2. **Infinite Scroll Pattern**
   - Intersection Observer triggers data loading when reaching list end
   - Page-based data fetching with automatic append to existing data
   - Maintains scroll position and virtual list state across loads

3. **Data Loading Strategy**
   - Server-side initial data load via React Router's `loader` function
   - Client-side incremental loading via `fetcher` API
   - Type-safe data contracts between server and client

4. **Component Structure**
   - Route components handle data loading and page layout
   - Shared components in `app/components/` for reusable UI
   - Strict TypeScript typing with no `any` types allowed

### Configuration Files

- **vite.config.ts**: Vite configuration with React Router plugin
- **react-router.config.ts**: React Router v7 specific configuration (SSR settings)
- **tsconfig.json**: TypeScript configuration with strict mode enabled

## Development Guidelines

### React Router v7 Best Practices
- Always use `loader` functions for initial data fetching
- Leverage `useFetcher` for client-side data updates without navigation
- Keep route modules focused on data loading and layout
- Use proper error boundaries and loading states

### Virtual List Considerations
- Monitor performance with large datasets
- Properly handle dynamic item heights if needed
- Ensure proper cleanup of observers and event listeners
- Test scroll restoration and position persistence

### Type Safety Requirements
- Never use `any` type - use `unknown` with type guards or proper interfaces
- All route data must be properly typed
- Maintain strict TypeScript configuration