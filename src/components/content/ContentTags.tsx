import { Box, Chip, Stack, Typography } from '@mui/material'

interface Tag {
  id: string
  tagName: string
}

interface ContentTagsProps {
  tags: Tag[]
}

export const ContentTags = ({ tags }: ContentTagsProps) => {
  if (!tags || tags.length === 0) return null

  return (
    <Box mb={3}>
      <Typography variant='h6' gutterBottom>
        Tags
      </Typography>
      <Stack direction='row' spacing={1} flexWrap='wrap' gap={1}>
        {tags.map(tag => (
          <Chip key={tag.id} label={tag.tagName} variant='outlined' size='small' />
        ))}
      </Stack>
    </Box>
  )
}
