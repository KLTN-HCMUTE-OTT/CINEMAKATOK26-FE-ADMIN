'use client'

// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material'

// Components
import { useSeasonManagement } from '../../hooks/useSeasonManagement'
import AddSeasonButton from './season-management/AddSeasonButton'
import SeasonList from './season-management/SeasonList'

interface SeasonManagementProps {
  seriesMetadata: any
  initialSeasons?: API.CreateSeasonDto[]
  onComplete: (seasons: API.CreateSeasonDto[]) => void
  onBack: () => void
}

const SeasonManagement = ({ seriesMetadata, initialSeasons = [], onComplete, onBack }: SeasonManagementProps) => {
  const {
    seasons,
    expandedSeason,
    editingSeason,
    editingEpisode,
    validationDialogOpen,
    validationErrors,
    episodesWithoutVideoCount,
    setExpandedSeason,
    setEditingSeason,
    setEditingEpisode,
    setValidationDialogOpen,
    handleAddSeason,
    handleSaveSeason,
    handleDeleteSeason,
    handleAddEpisode,
    handleSaveEpisode,
    handleDeleteEpisode,
    handleComplete,
    getTotalEpisodes
  } = useSeasonManagement({ initialSeasons, onComplete })

  return (
    <Box>
      {/* Show critical warning at the top if episodes are missing videos */}
      {episodesWithoutVideoCount > 0 && (
        <Alert severity='error' sx={{ mb: 3 }}>
          <Typography variant='body1' sx={{ fontWeight: 600, mb: 1 }}>
            {episodesWithoutVideoCount} Episode{episodesWithoutVideoCount > 1 ? 's' : ''} Missing Videos!
          </Typography>
          <Typography variant='body2'>
            You must upload videos for all episodes before you can continue. Episodes without videos cannot be
            published.
          </Typography>
        </Alert>
      )}

      {/* Header with Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Seasons & Episodes
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`${seasons.length} Seasons`} color='primary' />
              <Chip label={`${getTotalEpisodes()} Episodes`} color='secondary' />
              {/* Show warning if episodes missing videos */}
              {episodesWithoutVideoCount > 0 && (
                <Chip
                  label={`${episodesWithoutVideoCount} without video`}
                  color='error'
                  icon={<i className='ri-alert-line' />}
                />
              )}
            </Box>
          </Box>

          <Alert severity='info' sx={{ mb: 2 }}>
            <Typography variant='body2'>
              <strong>Series:</strong> {seriesMetadata.title}
            </Typography>
            <Typography variant='body2' sx={{ mt: 1 }}>
              <strong>Important:</strong> Each episode MUST have a video uploaded before you can continue.
            </Typography>
          </Alert>

          <AddSeasonButton onAddSeason={handleAddSeason} />
        </CardContent>
      </Card>

      {/* Seasons List */}
      <SeasonList
        seasons={seasons}
        expandedSeason={expandedSeason}
        editingSeason={editingSeason}
        editingEpisode={editingEpisode}
        setExpandedSeason={setExpandedSeason}
        setEditingSeason={setEditingSeason}
        setEditingEpisode={setEditingEpisode}
        handleSaveSeason={handleSaveSeason}
        handleDeleteSeason={handleDeleteSeason}
        handleAddEpisode={handleAddEpisode}
        handleSaveEpisode={handleSaveEpisode}
        handleDeleteEpisode={handleDeleteEpisode}
      />

      {/* Action Buttons */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onBack} startIcon={<i className='ri-arrow-left-line' />}>
              Back to Metadata
            </Button>
            <Button
              variant='contained'
              size='large'
              onClick={handleComplete}
              disabled={seasons.length === 0 || getTotalEpisodes() === 0 || episodesWithoutVideoCount > 0}
              startIcon={<i className='ri-arrow-right-line' />}
            >
              Continue to Review
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Validation Error Dialog */}
      <Dialog open={validationDialogOpen} onClose={() => setValidationDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className='ri-error-warning-line' style={{ color: '#f44336' }} />
          Validation Failed
        </DialogTitle>
        <DialogContent>
          <Alert severity='error' sx={{ mb: 2 }}>
            Please fix the following issues before continuing:
          </Alert>
          <List dense>
            {validationErrors.map((error, index) => (
              <ListItem key={index}>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialogOpen(false)} variant='contained'>
            OK, I&apos;ll fix it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SeasonManagement
