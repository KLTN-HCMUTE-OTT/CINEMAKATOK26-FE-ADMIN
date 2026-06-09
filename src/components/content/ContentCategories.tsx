import { Box, Chip, Stack, Typography } from '@mui/material'

interface Category {
  id: string
  categoryName: string
}

interface ContentCategoriesProps {
  categories: Category[]
}

export const ContentCategories = ({ categories }: ContentCategoriesProps) => {
  if (!categories || categories.length === 0) return null

  return (
    <Box mb={3}>
      <Typography variant='h6' gutterBottom>
        Categories
      </Typography>
      <Stack direction='row' spacing={1} flexWrap='wrap' gap={1}>
        {categories.map(category => (
          <Chip key={category.id} label={category.categoryName} color='primary' size='small' />
        ))}
      </Stack>
    </Box>
  )
}
