import React from 'react'
import { IconBaseProps } from 'react-icons'
import catIcon from '../../assets/classic-cfw-cat.png'

function MihomoIcon({ className, style, title, size = 32 }: IconBaseProps): React.JSX.Element {
  return (
    <img
      src={catIcon}
      alt={title || 'Clash Party'}
      className={className}
      width={size}
      height={size}
      style={{ ...style, width: size, height: size, flexShrink: 0, marginRight: 5 }}
    />
  )
}

export default MihomoIcon
