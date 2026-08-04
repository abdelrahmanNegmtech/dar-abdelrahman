# DAR App Architecture

## Folder responsibilities

- `app/`: Next.js App Router routes, layouts, metadata, and route groups.
- `app/(public)/`: Future public-facing routes that do not require authentication.
- `app/(auth)/`: Future authentication routes such as sign-in and account recovery. No auth screens are implemented yet.
- `app/(dashboard)/`: Future authenticated product routes and dashboard workflows.
- `components/`: Reusable React components shared across routes and features.
- `components/ui/`: Low-level design-system primitives such as buttons, inputs, dialogs, and badges.
- `components/shared/`: Cross-feature composed components that are not tied to one route.
- `components/layout/`: Shell, navigation, headers, footers, and layout composition components.
- `components/forms/`: Reusable form components and field wrappers.
- `lib/`: Framework-agnostic application helpers and integration entry points.
- `lib/constants/`: Stable application constants.
- `lib/utils/`: Small utility functions shared across the codebase.
- `lib/validations/`: Shared validation schemas and validation helpers.
- `lib/supabase/`: Future Supabase integration code. Clients are intentionally not created yet.
- `hooks/`: Shared React hooks.
- `types/`: Global TypeScript types shared across application layers.
- `services/`: Service-layer modules for external APIs and domain workflows.
- `styles/`: Shared style assets beyond `app/globals.css`.
- `docs/`: Architecture and team-facing project documentation.
- `public/`: Static assets served from the site root.

## Naming conventions

- Use kebab-case for route folders and non-component filenames.
- Use PascalCase for React component files and component exports.
- Use camelCase for functions, hooks, variables, and service methods.
- Prefix hooks with `use`.
- Keep route groups wrapped in parentheses, such as `(auth)`, when the folder is organizational and should not affect the URL.

## Component organization

Start components in the narrowest sensible folder. Promote components into `shared` only after they are used by multiple features. Keep `ui` components generic and free of business behavior. Keep route-specific composition close to the route until reuse is clear.

## Future authentication location

Authentication UI should be placed under `app/(auth)/`. Supabase browser/server helpers should live under `lib/supabase/`. Shared auth forms can live under `components/forms/` or a future feature-specific folder once the authentication design is confirmed.

## Future dashboard location

Authenticated dashboard routes should be placed under `app/(dashboard)/`. Shared dashboard shell components should live in `components/layout/`, while reusable dashboard widgets can be promoted into `components/shared/` when multiple dashboard areas need them.
