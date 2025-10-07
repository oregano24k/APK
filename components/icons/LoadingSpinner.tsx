
import React from 'react';

// Fix: The `jsx` prop is not a valid attribute for the `<style>` tag in a standard React setup.
// Replaced the `<style>` tag with Tailwind CSS's `animate-spin` class for a more idiomatic and correct implementation within this Tailwind-based project.
export const LoadingSpinner: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
    className={['animate-spin', props.className].filter(Boolean).join(' ')}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.75V6.25"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.125 6.875L16.065 7.935"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.25 12H17.75"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.125 17.125L16.065 16.065"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19.25V17.75"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6.875 17.125L7.935 16.065"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.75 12H6.25"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6.875 6.875L7.935 7.935"
    />
  </svg>
);
