import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

vi.mock('../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../api/axiosConfig';

function renderAuthRoute(element, initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={element} />
        <Route path="/register" element={element} />
        <Route path="/hub" element={<div>Hub Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Authentication flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs a user in and stores cafe credentials', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'token-abc', cafeName: 'Rocket Cafe' },
    });

    renderAuthRoute(<LoginPage />, '/login');

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
      target: { value: 'owner1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'owner1',
        password: 'secret123',
      });
      expect(localStorage.getItem('cafe_token')).toBe('token-abc');
      expect(localStorage.getItem('cafe_name')).toBe('Rocket Cafe');
      expect(screen.getByText(/hub screen/i)).toBeInTheDocument();
    });
  });

  it('registers a new cafe and stores the returned credentials', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'token-new', cafeName: 'Moonlight Cafe' },
    });

    renderAuthRoute(<RegisterPage />, '/register');

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. central perk/i), {
      target: { value: 'Moonlight Cafe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
      target: { value: 'newowner' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'welcome123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        username: 'newowner',
        password: 'welcome123',
        cafeName: 'Moonlight Cafe',
      });
      expect(localStorage.getItem('cafe_token')).toBe('token-new');
      expect(localStorage.getItem('cafe_name')).toBe('Moonlight Cafe');
      expect(screen.getByText(/hub screen/i)).toBeInTheDocument();
    });
  });
});
