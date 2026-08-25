import * as LucideIcons from 'lucide-react'

const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u

function isEmoji(str) {
  return typeof str === 'string' && emojiRegex.test(str) && str.length === 1
}

export function Icon({ name, size = 20, className = '', ...props }) {
  if (isEmoji(name)) {
    return <span className={className} style={{ fontSize: size }} {...props}>{name}</span>
  }

  const IconComponent = LucideIcons[name]
  if (!IconComponent) {
    return <span className={className} {...props}>{name}</span>
  }
  return <IconComponent size={size} className={className} {...props} />
}