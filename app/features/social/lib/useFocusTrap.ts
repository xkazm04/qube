import { useEffect, useRef, useCallback, RefObject } from 'react';

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
  autoFocusSelector?: string;
  returnFocusOnClose?: boolean;
}

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions
): RefObject<T | null> {
  const { isActive, onEscape, autoFocusSelector, returnFocusOnClose = true } = options;
  const containerRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    const elements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    return Array.from(elements).filter(
      (el) => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden'
    );
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;

      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        event.stopPropagation();
        onEscape();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isActive, onEscape, getFocusableElements]
  );

  useEffect(() => {
    if (isActive) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      const timeoutId = setTimeout(() => {
        if (!containerRef.current) return;

        if (autoFocusSelector) {
          const autoFocusElement = containerRef.current.querySelector<HTMLElement>(autoFocusSelector);
          if (autoFocusElement) {
            autoFocusElement.focus();
            return;
          }
        }

        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, 50);

      document.addEventListener('keydown', handleKeyDown, true);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    } else if (returnFocusOnClose && previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
      previouslyFocusedElement.current = null;
    }
  }, [isActive, autoFocusSelector, returnFocusOnClose, handleKeyDown, getFocusableElements]);

  return containerRef;
}
