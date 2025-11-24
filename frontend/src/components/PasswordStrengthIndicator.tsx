import { type PasswordStrength } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
}

export default function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  const getBarColor = (score: number) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-emerald-500',
    ]
    return colors[score]
  }

  const getBarWidth = (index: number) => {
    return index <= strength.score ? 'w-full' : 'w-0'
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex space-x-1 h-1.5">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getBarWidth(index)} ${getBarColor(strength.score)}`}
            />
          </div>
        ))}
      </div>

      {/* Strength Label */}
      <div className="flex justify-between items-center text-xs">
        <span className={`font-semibold ${strength.color}`}>
          {strength.strength}
        </span>
        {strength.crackTime && (
          <span className="text-gray-500">
            Time to crack: {strength.crackTime}
          </span>
        )}
      </div>

      {/* Feedback */}
      {strength.feedback.warning && (
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          ⚠️ {strength.feedback.warning}
        </div>
      )}

      {strength.feedback.suggestions.length > 0 && (
        <div className="text-xs text-gray-600 space-y-1">
          {strength.feedback.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-1">
              <span>•</span>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
