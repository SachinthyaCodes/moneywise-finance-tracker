// toastStyles.ts
export const toastStyles = {
  success: {
    style: {
      background: '#059669',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '10px',
      fontSize: '0.875rem',
      fontWeight: '500',
      minWidth: '300px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      textAlign: 'center' as const,
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#059669',
    },
    duration: 3000,
    position: 'top-center' as const,
  },
  error: {
    style: {
      background: '#DC2626',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '10px',
      fontSize: '0.875rem',
      fontWeight: '500',
      minWidth: '300px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      textAlign: 'center' as const,
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#DC2626',
    },
    duration: 4000,
    position: 'top-center' as const,
  }
}; 