import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ userId: 'test-user', isSignedIn: true }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignIn: () => null,
  SignUp: () => null,
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useQuery: () => ({ data: null, isLoading: false }),
  useMutation: () => ({ mutate: () => {}, isPending: false }),
}))
