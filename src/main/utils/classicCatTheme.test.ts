import { describe, expect, it } from 'vitest'
import { getClassicCatColor, type TrayIconStatus } from './classicCatTheme'

describe('classic CFW cat tray colors', () => {
  for (const mode of ['rule', 'direct', 'global']) {
    it(`uses blue while both proxy switches are off in ${mode} mode`, () => {
      expect(getClassicCatColor('white', mode)).toBe('blue')
    })
    it(`uses the requested system proxy color in ${mode} mode`, () => {
      expect(getClassicCatColor('blue', mode)).toBe(mode === 'global' ? 'orange' : 'green')
    })
    for (const status of ['green', 'red'] as TrayIconStatus[]) {
      it(`keeps TUN orange for ${status} in ${mode} mode`, () => {
        expect(getClassicCatColor(status, mode)).toBe('orange')
      })
    }
  }
})
