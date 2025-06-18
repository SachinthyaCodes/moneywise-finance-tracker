import '@testing-library/jest-dom';
import React from 'react';

// Mock Next.js's dynamic import
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = 'DynamicComponent';
  return DynamicComponent;
});

// Mock the useRouter hook from Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Using createElement instead of JSX to avoid TypeScript issues
    return React.createElement('img', {
      ...props,
      alt: props.alt || ''
    });
  },
}));

// Fix for requestAnimationFrame not being available in test environment
global.requestAnimationFrame = function(callback: FrameRequestCallback): number {
  return setTimeout(() => callback(Date.now()), 0) as unknown as number;
};

global.cancelAnimationFrame = function(id: number): void {
  clearTimeout(id as unknown as NodeJS.Timeout);
};

// Mock IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(private callback: IntersectionObserverCallback) {}
  
  disconnect(): void {
    // No-op in test environment
  }
  
  observe(): void {
    // No-op in test environment
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  
  unobserve(): void {
    // No-op in test environment
  }
} as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
