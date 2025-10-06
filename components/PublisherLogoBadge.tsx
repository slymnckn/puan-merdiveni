"use client"

import { cn } from "@/lib/utils"
import { getAssetPath } from "@/lib/asset-path"

interface PublisherLogoBadgeProps {
  logoUrl?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
  fallbackLogo?: string
}

const SIZE_MAP: Record<NonNullable<PublisherLogoBadgeProps["size"]>, { container: string; image: string; boxSize: string }> = {
  sm: {
    container: "p-2",
    image: "h-12 w-12",
    boxSize: "64px",
  },
  md: {
    container: "p-2.5",
    image: "h-14 w-14",
    boxSize: "72px",
  },
  lg: {
    container: "p-3",
    image: "h-16 w-16",
    boxSize: "88px",
  },
}

export default function PublisherLogoBadge({
  logoUrl,
  className,
  size = "md",
  fallbackLogo = "/placeholder-logo.png",
}: PublisherLogoBadgeProps) {
  const resolvedLogo = logoUrl && logoUrl.trim().length > 0 ? logoUrl : getAssetPath(fallbackLogo)
  const sizeStyles = SIZE_MAP[size]

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-white/90 border border-white/60 shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur",
        sizeStyles.container,
        className
      )}
      style={{ 
        width: sizeStyles.boxSize, 
        height: sizeStyles.boxSize, 
        borderRadius: "12px" 
      }}
    >
      <div className={cn("bg-white/80 p-1 border border-white/50", size === "sm" ? "p-1" : "p-1.5")}
        style={{ boxShadow: "inset 0 1px 4px rgba(0,0,0,0.08)", borderRadius: "8px" }}
      >
        <img
          src={resolvedLogo}
          alt="Publisher logo"
          className={cn("object-contain", sizeStyles.image)}
        />
      </div>
    </div>
  )
}
