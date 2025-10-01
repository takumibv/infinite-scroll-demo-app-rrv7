import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Link as ReactRouterLink } from 'react-router';
import ProTip from '~/components/ProTip';
import Copyright from '~/components/Copyright';

export function meta() {
  return [
    { title: 'Material UI - React Router example in TypeScript' },
    {
      name: 'description',
      content: 'Welcome to Material UI - React Router example in TypeScript!',
    },
  ];
}

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          React Router v7 - Infinite Scroll Demo
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          <Link to="/items" color="primary" component={ReactRouterLink}>
            🚀 Go to Infinite Scroll Demo
          </Link>
          <Link to="/about" color="secondary" component={ReactRouterLink}>
            Go to the about page
          </Link>
        </Box>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
}
