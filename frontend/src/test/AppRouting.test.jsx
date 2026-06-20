import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import App from '../App';

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('redirects unauthenticated users to login when they try a protected route', async () => {
    window.history.pushState({}, '', '/menu');

    render(<App />);

    expect(screen.getByText(/owner login/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('lets authenticated users reach the hub page', async () => {
    localStorage.setItem('cafe_token', 'token-123');
    localStorage.setItem('cafe_name', 'Test Cafe');
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(await screen.findByText(/welcome to test cafe/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/hub');
  });
});
