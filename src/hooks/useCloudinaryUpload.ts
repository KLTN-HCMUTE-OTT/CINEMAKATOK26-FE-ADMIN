import { useState } from 'react'

import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/configs/cloudinary'

export const useCloudinaryUpload = () => {
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()

    
return data.secure_url
  }

  const uploadThumbnail = async (file: File): Promise<string> => {
    setUploadingThumbnail(true)

    try {
      return await uploadImageToCloudinary(file)
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const uploadBanner = async (file: File): Promise<string> => {
    setUploadingBanner(true)

    try {
      return await uploadImageToCloudinary(file)
    } finally {
      setUploadingBanner(false)
    }
  }

  return {
    uploadingThumbnail,
    uploadingBanner,
    uploadThumbnail,
    uploadBanner
  }
}
