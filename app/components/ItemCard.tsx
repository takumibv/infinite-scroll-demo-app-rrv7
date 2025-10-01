import { Card, CardContent, Typography, Box } from '@mui/material';
import type { Item } from '~/utils/mockApi';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
          }}
        >
          {item.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
        >
          {item.description}
        </Typography>

        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'block' }}
          >
            ID: {item.id}
          </Typography>
          <Typography
            variant="caption"
            color="text.disabled"
          >
            {new Date(item.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}