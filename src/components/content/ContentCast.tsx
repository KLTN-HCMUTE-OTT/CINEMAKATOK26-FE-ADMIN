import Link from 'next/link'

import { Avatar, Box, Grid, Typography } from '@mui/material'

interface Actor {
  id: string
  name: string
  profilePicture?: string
}

interface ContentCastProps {
  actors: Actor[]
}

export const ContentCast = ({ actors }: ContentCastProps) => {
  if (!actors || actors.length === 0) return null

  return (
    <>
      <Typography variant='h6' gutterBottom>
        Cast
      </Typography>
      <Grid container spacing={2} mb={3}>
        {actors.map(actor => (
          <Grid item xs={12} sm={6} md={4} key={actor.id}>
            <Box display='flex' alignItems='center' gap={2}>
              <Avatar src={actor.profilePicture} alt={actor.name}>
                {actor.name?.[0]}
              </Avatar>
              <Box>
                <Link href={`/person/actors/${actor.id}`} style={{ textDecoration: 'none' }}>
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
                    {actor.name}
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
