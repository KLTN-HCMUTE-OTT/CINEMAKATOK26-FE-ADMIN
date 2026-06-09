import Link from 'next/link'

import { Avatar, Box, Grid, Typography } from '@mui/material'

interface Director {
  id: string
  name: string
  profilePicture?: string
}

interface ContentDirectorsProps {
  directors: Director[]
}

export const ContentDirectors = ({ directors }: ContentDirectorsProps) => {
  if (!directors || directors.length === 0) return null

  return (
    <>
      <Typography variant='h6' gutterBottom>
        Directors
      </Typography>
      <Grid container spacing={2}>
        {directors.map(director => (
          <Grid item xs={12} sm={6} md={4} key={director.id}>
            <Box display='flex' alignItems='center' gap={2}>
              <Avatar src={director.profilePicture} alt={director.name}>
                {director.name?.[0]}
              </Avatar>
              <Box>
                <Link href={`/person/directors/${director.id}`} style={{ textDecoration: 'none' }}>
                  <Typography
                    variant='body2'
                    fontWeight='medium'
                    sx={{
                      color: 'text.primary',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    {director.name}
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  )
}
