export type TrayIconStatus = 'white' | 'blue' | 'green' | 'red'
export type ClassicCatColor = 'blue' | 'green' | 'orange'

export function getClassicCatColor(status: TrayIconStatus, mode = 'rule'): ClassicCatColor {
  if (status === 'white') return 'blue'
  if (status === 'green' || status === 'red' || mode === 'global') return 'orange'
  return 'green'
}
