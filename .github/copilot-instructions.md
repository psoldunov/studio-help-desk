# AI Coding Agent Instructions

## Project Context

Next.js 16 (App Router) help desk application with email/password authentication via Better Auth, PostgreSQL + Prisma ORM, Bun runtime, Biome linter/formatter, and shadcn/ui components with Tailwind CSS v4.

## Critical Setup Requirements

**Package Manager**: ALWAYS use `bun` or `bunx` - never npm/yarn/pnpm
**Prisma Client Import**: Import from `@/prisma/client` (not `@prisma/client`) - client generates to `src/prisma/` directory
**Environment**: Requires `DATABASE_URL` in `.env` for PostgreSQL connection

## Code Style (Enforced by Biome)

- **Indentation**: tabs (not spaces)
- **Quotes**: single quotes for JS/TS, single quotes for JSX
- **Class ordering**: Tailwind classes auto-sorted via Biome's `useSortedClasses` rule
- **Lint command**: `bun run lint` (runs Biome, not ESLint)
- **Auto-fix**: `bunx biome check --write .`

Example:
```tsx
// Correct style
import { cn } from '@/lib/utils';

export function Component() {
	return <div className={cn('flex items-center gap-2 bg-white p-4')}>Content</div>;
}
```

## Authentication Architecture

**Better Auth** handles all authentication:
- **Server config**: `src/lib/auth/index.ts` - betterAuth instance with Prisma adapter
- **Client hooks**: `src/lib/auth/client.ts` - `useSession`, `signIn`, `signUp`, `signOut`
- **API routes**: `src/app/api/auth/[...all]/route.ts` - catch-all handler using `toNextJsHandler`
- **Server actions**: `src/lib/auth/actions/email.ts` - sign-in/sign-up server actions
- **Route protection**: `src/proxy.ts` - Next.js middleware checking session cookies

### Auth Flow Pattern
Client-side sign-in pattern (see `src/components/auth/sign-in.tsx`):
```tsx
'use client';
import { signIn } from '@/lib/auth/client';

await signIn.email(
	{ email, password, callbackURL: '/dashboard' },
	{ onRequest: () => setLoading(true), onResponse: () => router.push('/dashboard') }
);
```

Client-side sign-up with image upload (see `src/components/auth/sign-up.tsx`):
```tsx
'use client';
import { signUp } from '@/lib/auth/client';
import { toast } from 'sonner';

await signUp.email({
	email,
	password,
	name: `${firstName} ${lastName}`,
	image: imageBase64,  // Base64 encoded image
	callbackURL: '/dashboard',
	fetchOptions: {
		onRequest: () => setLoading(true),
		onSuccess: () => router.push('/dashboard'),
		onError: (ctx) => toast.error(ctx.error.message),
	},
});
```

Server action pattern (see `src/lib/auth/actions/email.ts`):
```tsx
'use server';
import auth from '@/lib/auth';

export const signInWithEmail = async ({ email, password }: { email: string; password: string }) =>
	await auth.api.signInEmail({
		body: { email, password, callbackURL: '/dashboard' },
		asResponse: true,
	});
```

Sign-out pattern (see `src/app/test/_page-client.tsx`):
```tsx
'use client';
import { signOut } from '@/lib/auth/client';

await signOut({
	fetchOptions: {
		onSuccess: () => router.push('/'),
	},
});
```

## Database Patterns

### Schema Location
`prisma/schema.prisma` defines User, Session, Account, Verification models for Better Auth

### Critical Configuration
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/prisma"  // Custom output directory
}
```

### Common Commands
```bash
bunx prisma migrate dev        # Create migration + apply + generate client
bunx prisma db push           # Push schema without migration (dev only)
bunx prisma studio            # Visual database browser
bunx prisma generate          # Regenerate client after schema changes
```

### Import Pattern
```typescript
// CORRECT
import { PrismaClient } from '@/prisma/client';

// WRONG - will fail
import { PrismaClient } from '@prisma/client';
```

## Component Conventions

**shadcn/ui**: "new-york" style with Radix UI primitives in `src/components/ui/`
- Components use `cn()` utility from `src/lib/utils/index.ts` for conditional classes
- Icons from `lucide-react`
- Toast notifications via `sonner` library (`import { toast } from 'sonner'`)
- Form components: Input, Label, Button, Checkbox, Card, Tabs

**Client/Server Boundaries**:
- Mark client components with `'use client'` directive
- Mark server actions with `'use server'` directive
- Better Auth client hooks (`useSession`, `signIn`, `signOut`) require client components
- Server-side session: Use `getSession()` from `@/lib/auth/actions/session` in Server Components

Example patterns:
```tsx
// Client component with auth hook
'use client';
import { useSession } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';

export function UserProfile() {
	const { data: session } = useSession();
	return <Button>Hello {session?.user?.name}</Button>;
}

// Server component with session
import getSession from '@/lib/auth/actions/session';

export default async function Page() {
	const session = await getSession();
	return <div>{session ? session.user.email : 'Not logged in'}</div>;
}
```

## Path Aliases

Configured in `tsconfig.json`:
- `@/*` → `src/*`

Examples:
- `@/lib/auth/client` → `src/lib/auth/client.ts`
- `@/components/ui/button` → `src/components/ui/button.tsx`
- `@/prisma/client` → `src/prisma/client` (Prisma generated code)

## Middleware & Route Protection

`src/proxy.ts` implements Next.js middleware for protected routes:
```typescript
export const config = {
	matcher: ['/test'],  // Add protected routes here
};
```

Uses Better Auth's `getSessionCookie()` to check authentication, redirects to `/` if unauthenticated.

## Development Workflow

1. **Database changes**: Edit `prisma/schema.prisma` → `bunx prisma migrate dev --name description`
2. **New components**: Use `bunx shadcn@latest add <component>` for UI components
3. **Styling**: Use Tailwind utilities; Biome auto-sorts classes on save
4. **Testing auth**: Create user via sign-up, test protected `/test` route
5. **Before commit**: Run `bun run lint` to ensure code quality

## Common Patterns

**Form submission with loading state** (from `sign-in.tsx`):
```tsx
const [loading, setLoading] = useState(false);

<Button
	disabled={loading}
	onClick={async () => {
		await signIn.email({ email, password }, {
			onRequest: () => setLoading(true),
			onResponse: () => setLoading(false),
		});
	}}
>
	{loading ? <Loader2 className='animate-spin' /> : 'Submit'}
</Button>
```

**Conditional styling with cn()** (from `src/lib/utils/index.ts`):
```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-class', isActive && 'active-class', className)} />
```

## Known Configuration

- **Next.js**: App Router (no Pages directory)
- **Fonts**: Geist Sans + Geist Mono configured in `src/fonts/index.ts`, imported in `src/app/layout.tsx`
- **Theming**: CSS variables in `src/app/globals.css` with dark mode support via `.dark` class
- **Tailwind**: v4 with `@import "tailwindcss"` in globals.css, uses OKLCH color space
- **Base URL**: Auth client hardcoded to `http://localhost:3000` (update for production)
- **Port**: Dev server runs on `localhost:3000`
- **Image handling**: Next.js Image component for profile images, supports Base64 uploads in sign-up
