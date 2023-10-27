import React from 'react'
import { css } from '@emotion/react'

export default function Error404({nuevoProducto}) {
  return (
    <h1
        css={css`
            margin-top: 5rem;
            text-align: center;
        `}
    >
      {nuevoProducto ? 'No se puede mostrar' : 'Producto no existente'}
    </h1>
  )
}
