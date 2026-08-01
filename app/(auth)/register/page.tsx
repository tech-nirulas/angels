// app/register/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page because passwordless login handles registration automatically
    router.replace('/login');
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF8F7 0%, #FFECEF 100%)',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        Redirecting to passwordless sign-in...
      </Typography>
    </Box>
  );
}