declare module 'emoji-picker-react' {
  export interface EmojiData {
    emoji: string
    unified: string
    originalUnified: string
    names: string[]
    id: string
  }

  export interface EmojiPickerProps {
    onEmojiClick: (emojiData: EmojiData) => void
    width?: number
    height?: number
    searchPlaceholder?: string
    theme?: 'light' | 'dark'
    previewConfig?: {
      showPreview?: boolean
    }
  }

  const EmojiPicker: React.FC<EmojiPickerProps>
  export default EmojiPicker
} 