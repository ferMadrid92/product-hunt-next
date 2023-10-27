import { useContext } from 'react'
import Link from 'next/link'
import styled from '@emotion/styled'
import { FirebaseContext } from "../../firebase"

const Nav = styled.nav`
    padding: 2rem 0rem;
    a {
        font-size: 1.8rem;
        margin-left: 2rem;
        color: var(--gris2);
        font-family: 'PT Sans', sans-serif;

        &:last-of-type {
            margin-right: 0;
        }

        &:first-of-type {
            margin-left: 0rem;
        }
        @media (min-width: 768px) {
          &:first-of-type {
            margin-left: 2rem;
        }
        }
    }
    @media (min-width: 768px) {
          padding-left: 2rem;
        }
`

export default function Navegacion() {

  const { usuario } = useContext(FirebaseContext)

  return (
    <Nav>
      <Link href={'/'}>Inicio</Link>
      <Link href={'/populares'}>Populares</Link>
      {usuario && (
        <Link href={'/nuevo-producto'}>Nuevo Producto</Link>
      )}
    </Nav>
  )
}
