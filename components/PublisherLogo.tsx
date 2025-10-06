"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { getAssetPath } from "@/lib/asset-path"

interface PublisherLogoProps {
  publisherId?: number
  fallbackLogo?: string
  className?: string
  alt?: string
}

export default function PublisherLogo({ 
  publisherId, 
  fallbackLogo = "/placeholder-logo.png",
  className = "h-12 w-auto",
  alt = "Publisher Logo"
}: PublisherLogoProps) {
  const normalizedFallbackLogo = getAssetPath(fallbackLogo)
  const [logoUrl, setLogoUrl] = useState<string>(normalizedFallbackLogo)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!publisherId || publisherId === 0) {
      setLogoUrl(normalizedFallbackLogo)
      return
    }

    const fetchLogo = async () => {
      setLoading(true)
      
      try {
        const logo = await apiService.fetchPublisherLogo(publisherId)
        if (logo) {
          setLogoUrl(getAssetPath(logo))
        } else {
          setLogoUrl(normalizedFallbackLogo)
        }
      } catch (err) {
        console.error('Failed to fetch publisher logo:', err)
        setLogoUrl(normalizedFallbackLogo)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [publisherId, normalizedFallbackLogo])

  const handleImageError = () => {
    if (logoUrl !== normalizedFallbackLogo) {
      setLogoUrl(normalizedFallbackLogo)
    }
  }

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200 rounded animate-pulse`}>
        <svg 
          className="h-6 w-6 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      onError={handleImageError}
      style={{
        maxWidth: '200px',
        objectFit: 'contain'
      }}
    />
  )
}