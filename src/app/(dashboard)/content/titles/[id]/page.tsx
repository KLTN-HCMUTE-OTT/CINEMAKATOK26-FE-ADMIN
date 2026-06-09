'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Tabs, Tab, Card, CardContent, Grid, Avatar, Chip, Button, IconButton } from '@mui/material'

// Components Imports
import StatusBadge from '@components/shared/StatusBadge'
import DataTable from '@components/shared/DataTable'
import VideoUploader from '@components/shared/VideoUploader'
import SeasonsManagement from '@components/organisms/SeasonsManagement'
import EpisodesManagement from '@components/organisms/EpisodesManagement'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`title-tabpanel-${index}`}
      aria-labelledby={`title-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

// Mock data for title details
const titleData = {
  id: 1,
  title: 'Stranger Things',
  type: 'Series',
  status: 'published',
  releaseDate: '2024-01-15',
  description:
    'A group of young friends in Hawkins, Indiana, encounter supernatural forces and secret government experiments.',
  genre: 'Sci-Fi, Horror, Drama',
  ageRating: 'TV-14',
  duration: '45-60 min per episode',
  language: 'English',
  director: 'The Duffer Brothers',
  cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour'],
  tags: ['supernatural', 'mystery', 'friendship', '80s'],
  views: '2.4M',
  rating: '8.9/10',
  poster: '/images/cards/1.png'
}


const mockAssets = [
  {
    id: 1,
    fileName: 'stranger_things_s01e01_4k.mp4',
    quality: '4K',
    size: '4.2 GB',
    status: 'ready',
    type: 'Video',
    uploadDate: '2024-01-10'
  },
  {
    id: 2,
    fileName: 'stranger_things_s01e01_1080p.mp4',
    quality: '1080p',
    size: '2.1 GB',
    status: 'ready',
    type: 'Video',
    uploadDate: '2024-01-10'
  },
  {
    id: 3,
    fileName: 'stranger_things_s01e01_720p.mp4',
    quality: '720p',
    size: '1.2 GB',
    status: 'ready',
    type: 'Video',
    uploadDate: '2024-01-10'
  },
  {
    id: 4,
    fileName: 'stranger_things_s01e01_subtitles.srt',
    quality: '-',
    size: '42 KB',
    status: 'ready',
    type: 'Subtitle',
    uploadDate: '2024-01-10'
  }
]

const TitleDetailPage = () => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const assetColumns = [
    { id: 'fileName', label: 'File Name', minWidth: 250 },
    {
      id: 'type',
      label: 'Type',
      minWidth: 100,
      format: (value: string) => <Chip label={value} size='small' color={value === 'Video' ? 'primary' : 'secondary'} />
    },
    { id: 'quality', label: 'Quality', minWidth: 100 },
    { id: 'size', label: 'Size', minWidth: 100 },
    { id: 'uploadDate', label: 'Upload Date', minWidth: 120 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => <StatusBadge status={value as any} />
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      format: () => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size='small'>
            <i className='ri-download-line' />
          </IconButton>
          <IconButton size='small' color='error'>
            <i className='ri-delete-bin-line' />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<i className='ri-arrow-left-line' />} href='/content/titles' sx={{ mb: 2 }}>
          Back to Titles
        </Button>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          {titleData.title}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage title details, seasons, episodes, and assets
        </Typography>
      </Box>

      {/* Title Overview Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Avatar
                src={titleData.poster}
                alt={titleData.title}
                sx={{ width: '100%', height: 200, borderRadius: 2 }}
                variant='rounded'
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant='h5' sx={{ mb: 1 }}>
                    {titleData.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={titleData.type} color='primary' size='small' />
                    <StatusBadge status={titleData.status as any} />
                    <Chip label={titleData.ageRating} size='small' />
                  </Box>
                </Box>
                <Button variant='contained' startIcon={<i className='ri-edit-line' />}>
                  Edit Title
                </Button>
              </Box>

              <Typography variant='body1' sx={{ mb: 3 }}>
                {titleData.description}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant='body2' color='text.secondary'>
                    Genre
                  </Typography>
                  <Typography variant='body1'>{titleData.genre}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant='body2' color='text.secondary'>
                    Release Date
                  </Typography>
                  <Typography variant='body1'>{titleData.releaseDate}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant='body2' color='text.secondary'>
                    Views
                  </Typography>
                  <Typography variant='body1'>{titleData.views}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant='body2' color='text.secondary'>
                    Rating
                  </Typography>
                  <Typography variant='body1'>{titleData.rating}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label='title detail tabs'>
            <Tab label='Overview' />
            <Tab label='Seasons' />
            <Tab label='Episodes' />
            <Tab label='Assets' />
            <Tab label='Upload' />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Director
                    </Typography>
                    <Typography variant='body1'>{titleData.director}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Language
                    </Typography>
                    <Typography variant='body1'>{titleData.language}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Duration
                    </Typography>
                    <Typography variant='body1'>{titleData.duration}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Cast
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {titleData.cast.map((actor, index) => (
                    <Typography key={index} variant='body1'>
                      {actor}
                    </Typography>
                  ))}
                </Box>

                <Typography variant='h6' sx={{ mb: 2, mt: 3 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {titleData.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size='small' variant='outlined' />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </TabPanel>

        {/* Seasons Tab */}
        <TabPanel value={tabValue} index={1}>
          <SeasonsManagement titleId={titleData.id} titleType={titleData.type} />
        </TabPanel>

        {/* Episodes Tab */}
        <TabPanel value={tabValue} index={2}>
          <EpisodesManagement titleId={titleData.id} titleType={titleData.type} />
        </TabPanel>

        {/* Assets Tab */}
        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Media Assets
            </Typography>
            <DataTable rows={mockAssets} emptyMessage='No assets found'>
              <DataTable.Toolbar>
                <DataTable.Search placeholder='Search assets...' />
              </DataTable.Toolbar>
              {assetColumns.map(column => (
                <DataTable.Column
                  key={column.id}
                  id={column.id}
                  label={column.label}
                  minWidth={column.minWidth}
                  format={column.format}
                />
              ))}
            </DataTable>
          </CardContent>
        </TabPanel>

        {/* Upload Tab */}
        <TabPanel value={tabValue} index={4}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Upload New Assets
            </Typography>
            <VideoUploader
              maxFileSize={10000} // 10GB for assets
              acceptedFormats={['.mp4', '.mov', '.avi', '.mkv', '.webm', '.srt']}
              uploadedFiles={mockAssets.map(asset => ({
                id: asset.id.toString(),
                name: asset.fileName,
                size: parseFloat(asset.size.split(' ')[0]) * 1024 * 1024 * 1024, // Convert GB to bytes (approximate)
                progress: 100,
                status: asset.status as any,
                quality: asset.quality
              }))}
            />
          </CardContent>
        </TabPanel>
      </Card>
    </Box>
  )
}

export default TitleDetailPage
