import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
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

import { AuthModal } from '@/components/AuthModal';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ data: { session: null } });
  mocks.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
});

describe('AuthModal', () => {
  it('does not render when closed', () => {
    render(<AuthModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the login form by default', () => {
    render(<AuthModal isOpen onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  // Regression: BrutalButton defaulted to type="button", so the old modal never
  // submitted on click. The submit control must be type="submit".
  it('submit button is type="submit"', () => {
    render(<AuthModal isOpen onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /entrar/i })).toHaveAttribute('type', 'submit');
  });

  it('clicking Entrar submits and calls signIn with the credentials, then closes', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<AuthModal isOpen onClose={onClose} />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.c');
    await user.type(screen.getByLabelText(/contraseña/i), 'secret1');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret1' }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows the error and stays open when sign-in fails', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<AuthModal isOpen onClose={onClose} />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.c');
    await user.type(screen.getByLabelText(/contraseña/i), 'secret1');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('toggles to register mode and calls signUp', async () => {
    mocks.signUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<AuthModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /regístrate/i }));
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email/i), 'a@b.c');
    await user.type(screen.getByLabelText(/contraseña/i), 'secret1');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => expect(mocks.signUp).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret1' }));
  });

  it('closes on the X button', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<AuthModal isOpen onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
