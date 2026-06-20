import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

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

describe('Menu page integration', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('cafe_token', 'token-123');
    localStorage.setItem('cafe_name', 'Skyline Cafe');
    window.history.pushState({}, '', '/menu');
  });

  it('renders menu items and updates the cart badge when an item is added', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          name: 'Cappuccino',
          price: 4.25,
          category: 'drinks',
          description: 'Rich espresso with foamed milk',
          stock: 6,
          imageFileName: '',
        },
        {
          id: 2,
          name: 'Blueberry Muffin',
          price: 3.5,
          category: 'bakery',
          description: 'Fresh baked muffin',
          stock: 0,
          imageFileName: '',
        },
      ],
    });

    render(<App />);

    expect(await screen.findByText(/skyline cafe menu/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /drinks/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bakery/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /unavailable/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
