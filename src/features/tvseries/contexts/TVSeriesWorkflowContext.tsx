'use client'

import { createContext, useContext, useMemo, useState } from 'react'

interface TVSeriesWorkflowContextValue {
  activeStep: number
  metadata: any
  seasons: API.CreateSeasonDto[]
  publishError: string | null
  setMetadata: (metadata: any) => void
  setSeasons: (seasons: API.CreateSeasonDto[]) => void
  setPublishError: (error: string | null) => void
  nextStep: () => void
  prevStep: () => void
  resetWorkflow: () => void
}

const TVSeriesWorkflowContext = createContext<TVSeriesWorkflowContextValue | null>(null)

interface TVSeriesWorkflowProviderProps {
  children: React.ReactNode
}

export function TVSeriesWorkflowProvider({ children }: TVSeriesWorkflowProviderProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [metadata, setMetadata] = useState<any>(null)
  const [seasons, setSeasons] = useState<API.CreateSeasonDto[]>([])
  const [publishError, setPublishError] = useState<string | null>(null)

  const value = useMemo<TVSeriesWorkflowContextValue>(
    () => ({
      activeStep,
      metadata,
      seasons,
      publishError,
      setMetadata,
      setSeasons,
      setPublishError,
      nextStep: () => setActiveStep(prev => prev + 1),
      prevStep: () => setActiveStep(prev => Math.max(prev - 1, 0)),
      resetWorkflow: () => {
        setActiveStep(0)
        setMetadata(null)
        setSeasons([])
        setPublishError(null)
      }
    }),
    [activeStep, metadata, publishError, seasons]
  )

  return <TVSeriesWorkflowContext.Provider value={value}>{children}</TVSeriesWorkflowContext.Provider>
}

export function useTVSeriesWorkflow() {
  const context = useContext(TVSeriesWorkflowContext)

  if (!context) {
    throw new Error('useTVSeriesWorkflow must be used within TVSeriesWorkflowProvider')
  }

  return context
}
