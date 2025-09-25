"use client"

import type { Question } from "@/types/game"

interface QuestionDisplayProps {
  question: Question
  className?: string
}

export default function QuestionDisplay({ question, className = "" }: QuestionDisplayProps) {
  const renderQuestion = () => {
    switch (question.type) {
      case "text":
        return (
          <div className="w-full text-center">
            <h2 className="text-white text-2xl font-bold text-center drop-shadow-lg">
              Soru: {question.text}
            </h2>
          </div>
        )

      case "image":
        return (
          <div className="w-full space-y-4">
            <h2 className="text-white text-2xl font-bold text-center drop-shadow-lg">
              Soru: {question.text}
            </h2>
            {question.image && (
              <div className="flex justify-start">
                <div className="bg-white p-2 rounded-lg shadow-lg w-48">
                  <img
                    src={question.image}
                    alt={question.imageAlt || "Soru görseli"}
                    className="w-full h-auto max-h-32 object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>
        )

      case "mixed":
        return (
          <div className="w-full space-y-4">
            <h2 className="text-white text-2xl font-bold text-center drop-shadow-lg">
              Soru: {question.text}
            </h2>
            {question.image && (
              <div className="flex justify-start">
                <div className="bg-white p-2 rounded-lg shadow-lg w-48">
                  <img
                    src={question.image}
                    alt={question.imageAlt || "Soru görseli"}
                    className="w-full h-auto max-h-32 object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="w-full text-center">
            <h2 className="text-white text-2xl font-bold text-center drop-shadow-lg">
              Soru: {question.text}
            </h2>
          </div>
        )
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderQuestion()}
    </div>
  )
}