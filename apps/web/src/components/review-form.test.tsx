import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiJson } from '@/lib/auth-client';
import { ReviewForm } from './review-form';

const router = vi.hoisted(() => ({
  refresh: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

vi.mock('@/lib/auth-client', () => ({
  apiJson: vi.fn(),
}));

describe('ReviewForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requires a star rating before publishing', () => {
    render(createElement(ReviewForm, { mediaType: 'movie', tmdbId: 157336 }));

    const publishButton = screen.getByRole('button', { name: /publish review/i });
    const form = publishButton.closest('form');

    expect(publishButton).toBeDisabled();
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(screen.getByText('Choose a star rating before publishing.')).toBeInTheDocument();
    expect(apiJson).not.toHaveBeenCalled();
  });

  it('publishes and resets the form after a selected rating', async () => {
    vi.mocked(apiJson).mockResolvedValueOnce({ id: 'review-1' });
    render(createElement(ReviewForm, { mediaType: 'movie', tmdbId: 157336 }));

    fireEvent.click(screen.getByRole('button', { name: /rate 4 stars/i }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Good' } });
    fireEvent.change(screen.getByRole('textbox', { name: /review/i }), {
      target: { value: 'good' },
    });

    const publishButton = screen.getByRole('button', { name: /publish review/i });
    const form = publishButton.closest('form');

    expect(publishButton).toBeEnabled();
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(apiJson).toHaveBeenCalledWith('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          mediaType: 'movie',
          tmdbId: 157336,
          rating: 4,
          title: 'Good',
          body: 'good',
          hasSpoilers: false,
        }),
      });
    });

    await waitFor(() => expect(router.refresh).toHaveBeenCalled());

    expect(screen.queryByText(/Cannot read properties of null/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /review/i })).toHaveValue('');
    expect(screen.getByRole('button', { name: /publish review/i })).toBeDisabled();
  });
});
