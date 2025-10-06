"use client"

import type { Question } from "@/types/game"
import { getAssetPath } from "@/lib/asset-path"

interface QuestionDisplayProps {
  question: Question
  className?: string
}

export default function QuestionDisplay({ question, className = "" }: QuestionDisplayProps) {
  const hasImage = !!(question.image_url && question.image_url.trim() !== '')
  const imageUrl = hasImage ? getAssetPath(question.image_url as string) : null
  
  // Debug için
  console.log('QuestionDisplay - question:', question)
  console.log('QuestionDisplay - hasImage:', hasImage)
  console.log('QuestionDisplay - image_url:', question.image_url)
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="w-full space-y-4">
        <h2 className="text-white text-2xl font-bold text-center drop-shadow-lg">
          Soru: {question.question_text}
        </h2>
        {hasImage && imageUrl && (
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-lg shadow-lg w-48">
              <img
                src={imageUrl}
                alt="Soru görseli"
                className="w-full h-auto max-h-32 object-contain rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}