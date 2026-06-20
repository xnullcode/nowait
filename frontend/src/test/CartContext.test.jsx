import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartProvider, useCart } from '../context/CartContext';

function CartProbe() {
  const { cart, subtotal, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

  return (
    <div>
      <div data-testid="count">{cart.length}</div>
      <div data-testid="subtotal">{subtotal.toFixed(2)}</div>
      <button onClick={() => addToCart({ id: 1, name: 'Latte', price: 4.5 })}>add latte</button>
      <button onClick={() => updateQuantity(1, 1)}>increase latte</button>
      <button onClick={() => updateQuantity(1, -1)}>decrease latte</button>
      <button onClick={() => removeFromCart(1)}>remove latte</button>
      <button onClick={clearCart}>clear cart</button>
    </div>
  );
}

describe('CartProvider', () => {
  it('adds items, updates quantities, removes items, and persists cart state', async () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /add latte/i }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('subtotal')).toHaveTextContent('4.50');

    fireEvent.click(screen.getByRole('button', { name: /increase latte/i }));
    expect(screen.getByTestId('subtotal')).toHaveTextContent('9.00');

    fireEvent.click(screen.getByRole('button', { name: /decrease latte/i }));
    expect(screen.getByTestId('subtotal')).toHaveTextContent('4.50');

    fireEvent.click(screen.getByRole('button', { name: /remove latte/i }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('subtotal')).toHaveTextContent('0.00');

    fireEvent.click(screen.getByRole('button', { name: /add latte/i }));
    fireEvent.click(screen.getByRole('button', { name: /clear cart/i }));

    await waitFor(() => {
      expect(localStorage.getItem('cafe_cart')).toBe('[]');
    });
  });
});
