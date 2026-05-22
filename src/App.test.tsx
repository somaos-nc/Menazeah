import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock Terminal component to avoid issues with xterm.js in JSDOM
vi.mock('./components/Terminal', () => ({
  default: ({ id, title }: { id: string; title: string }) => (
    <div data-testid={id}>{title}</div>
  ),
}));

describe('App Component', () => {
  it('renders the GitHub repository link in the header', () => {
    render(<App />);
    const repoLink = screen.getByRole('link', { name: /github/i });
    expect(repoLink).toBeInTheDocument();
    expect(repoLink).toHaveAttribute('href', 'https://github.com/somaos-nc/Menazeah');
  });
});
