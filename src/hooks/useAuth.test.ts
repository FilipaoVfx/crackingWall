import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signOut: mocks.signOut,
    },
  },
}));

import { useAuth } from '@/hooks/useAuth';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ data: { session: null } });
  mocks.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: mocks.unsubscribe } } });
});

describe('useAuth', () => {
  it('starts loading, then resolves with no user when there is no session', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('reflects an existing session', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1', email: 'a@b.c' } } } });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.user?.email).toBe('a@b.c'));
  });

  it('signIn delegates to supabase and returns its result', async () => {
    mocks.signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let res: unknown;
    await act(async () => {
      res = await result.current.signIn('a@b.c', 'secret1');
    });

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret1' });
    expect(res).toEqual({ data: { user: { id: 'u1' } }, error: null });
  });

  it('signUp delegates to supabase', async () => {
    mocks.signUp.mockResolvedValue({ data: {}, error: null });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('a@b.c', 'secret1');
    });
    expect(mocks.signUp).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret1' });
  });

  it('signOut delegates to supabase', async () => {
    mocks.signOut.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });
    expect(mocks.signOut).toHaveBeenCalled();
  });

  it('unsubscribes from auth changes on unmount', async () => {
    const { unmount } = renderHook(() => useAuth());
    await waitFor(() => expect(mocks.onAuthStateChange).toHaveBeenCalled());
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });
});
