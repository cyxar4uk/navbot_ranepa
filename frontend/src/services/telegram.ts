declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: {
      id: number
      is_bot?: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
    }
    auth_date: number
    hash: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    setText(text: string): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  ready(): void
  expand(): void
  close(): void
  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  sendData(data: string): void
}

class TelegramService {
  private webApp: TelegramWebApp | null = null

  constructor() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp
    }
  }

  get isAvailable(): boolean {
    return this.webApp !== null
  }

  get initData(): string {
    return this.webApp?.initData || ''
  }

  get user() {
    return this.webApp?.initDataUnsafe?.user
  }

  get colorScheme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'light'
  }

  get themeParams() {
    return this.webApp?.themeParams || {}
  }

  ready() {
    this.webApp?.ready()
  }

  expand() {
    this.webApp?.expand()
  }

  close() {
    this.webApp?.close()
  }

  // Back button
  showBackButton(callback: () => void) {
    if (this.webApp) {
      this.webApp.BackButton.onClick(callback)
      this.webApp.BackButton.show()
    }
  }

  hideBackButton() {
    this.webApp?.BackButton.hide()
  }

  // Main button
  showMainButton(text: string, callback: () => void) {
    if (this.webApp) {
      this.webApp.MainButton.setText(text)
      this.webApp.MainButton.onClick(callback)
      this.webApp.MainButton.show()
    }
  }

  hideMainButton() {
    this.webApp?.MainButton.hide()
  }

  setMainButtonLoading(loading: boolean) {
    if (loading) {
      this.webApp?.MainButton.showProgress()
    } else {
      this.webApp?.MainButton.hideProgress()
    }
  }

  // Haptic feedback
  hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light') {
    this.webApp?.HapticFeedback.impactOccurred(style)
  }

  hapticNotification(type: 'success' | 'warning' | 'error') {
    this.webApp?.HapticFeedback.notificationOccurred(type)
  }

  hapticSelection() {
    this.webApp?.HapticFeedback.selectionChanged()
  }

  // Popups
  showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showAlert(message, resolve)
      } else {
        alert(message)
        resolve()
      }
    })
  }

  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showConfirm(message, resolve)
      } else {
        resolve(confirm(message))
      }
    })
  }

  // Links
  openLink(url: string) {
    if (this.webApp) {
      this.webApp.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  openTelegramLink(url: string) {
    if (this.webApp) {
      this.webApp.openTelegramLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  // Theme
  setHeaderColor(color: string) {
    this.webApp?.setHeaderColor(color)
  }

  setBackgroundColor(color: string) {
    this.webApp?.setBackgroundColor(color)
  }

  // Data
  sendData(data: object) {
    this.webApp?.sendData(JSON.stringify(data))
  }
}

export const telegram = new TelegramService()
export default telegram
