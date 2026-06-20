import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Checkout flow', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('cafe_token', 'token-123');
    localStorage.setItem(
      'cafe_cart',
      JSON.stringify([
        { id: 1, name: 'Cappuccino', price: 4.25, quantity: 2 },
        { id: 2, name: 'Muffin', price: 3.5, quantity: 1 },
      ])
    );
    window.history.pushState({}, '', '/checkout');
  });

  it('submits the cart, clears it, and shows the success state', async () => {
    api.post.mockResolvedValueOnce({
      data: { orderId: 42 },
    });

    render(<App />);

    expect(await screen.findByText(/checkout/i)).toBeInTheDocument();
    expect(screen.getByText('2x Cappuccino')).toBeInTheDocument();
    expect(screen.getByText('1x Muffin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm & pay mock/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /confirm & pay mock/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/checkout', {
        items: [
          { menuItemId: 1, quantity: 2 },
          { menuItemId: 2, quantity: 1 },
        ],
      });
      expect(localStorage.getItem('cafe_cart')).toBe('[]');
      expect(screen.getByText(/order placed!/i)).toBeInTheDocument();
      expect(screen.getByText(/#42/i)).toBeInTheDocument();
    });
  });
});
