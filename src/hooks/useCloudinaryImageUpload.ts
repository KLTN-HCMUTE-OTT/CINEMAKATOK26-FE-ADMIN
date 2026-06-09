import { useState } from 'react'

import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/configs/cloudinary'

export const useCloudinaryImageUpload = () => {
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.secure_url) {
        return data.secure_url
      }

      throw new Error('Upload failed')
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      throw error
    }
  }

  const uploadThumbnailImage = async (file: File): Promise<string> => {
    setUploadingThumbnail(true)

    try {
      const url = await uploadToCloudinary(file)

      
return url
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const uploadBannerImage = async (file: File): Promise<string> => {
    setUploadingBanner(true)

    try {
      const url = await uploadToCloudinary(file)

      
return url
    } finally {
      setUploadingBanner(false)
    }
  }

  return {
    uploadingThumbnail,
    uploadingBanner,
    uploadThumbnailImage,
    uploadBannerImage
  }
}
