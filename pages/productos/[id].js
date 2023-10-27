import React, { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { FirebaseContext } from '../../firebase'
import {collection, getDoc, doc, updateDoc, runTransaction, deleteDoc} from 'firebase/firestore'
import Error404 from '../../components/layout/404'
import Layout from '../../components/layout/Layout'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import Spinner from '../../components/layout/Spinner'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { es } from 'date-fns/locale'
import { Campo, InputSubmit } from '../../components/ui/Formulario'
import Boton from '../../components/ui/Boton'
import Link from 'next/link'

const ContenedorProducto = styled.div`
    @media (min-width: 768px) {
        display: grid;
        grid-template-columns: 2fr 1fr;
        column-gap: 2rem;
    }
    aside p {
        text-align: center;
    }
    aside div {
        margin-top: 5rem;
    }
    li {
        border: 1px solid #e1e1e1;
        padding: 2rem;
    }
    span {
        font-weight: bold;
    }
`
const CreadorProducto = styled.p`
    padding: .5rem 2rem;
    background-color: var(--naranja);
    color: #fff;
    text-transform: uppercase;
    font-weight: bold;
    display: inline-block;
    text-align: center;
`

export default function Producto() {

    //state del componente
    const [producto, setProducto] = useState({})
    const [error, setError] = useState(false)
    const [comentario, setComentario] = useState({})
    const [consultarDB, setConsultarDB] = useState(true)

    // Routing para obtener el id actual
    const router = useRouter()
    const {query: { id }} = router

    //context de firebase
    const { firebase, usuario } = useContext(FirebaseContext)

    const { db } = firebase

    useEffect(() => {
        if(id && consultarDB) {
            const obtenerProducto = async () => {
                const productoQuery = await doc(collection(db, "productos"), id)
                const producto = await getDoc(productoQuery)
                if(producto.exists()) {
                    setProducto(producto.data())
                    setConsultarDB(false)
                } else {
                    setError(true)
                    setConsultarDB(false)
                }
           }
           obtenerProducto()
        }
    }, [id])

    if(Object.keys(producto).length === 0 && !error) return <Spinner />
  
    const {nombre, empresa, urlImagen, url, descripcion, creado, comentarios, votos, creador, haVotado} = producto

    // Administrar y validar los votos
    const votarProducto = async () => {
        if(!usuario) {
            return router.push('/iniciar-sesion')
        }
        // obtener la referencia del documento
        const docRef = await doc(collection(db, "productos"), id)

        // ejecutar una transacción
        await runTransaction(db, async (transaction) => {
            // leer el documento actual
            const productoDoc = await transaction.get(docRef)
            // verificar si el documento existe
            if(!productoDoc.exists()) {
                setError(true)
            }
            // obtener los datos actuales del documento
            const productoData = productoDoc.data();

            // verificar si el usuario actual ha votado
            if(productoData.haVotado.includes(usuario.uid)) return

            // obtener y sumar un nuevo voto
            const nuevoTotal = productoData.votos + 1

            // guardar el ID del usuario que ha votado
            const votantes = [...productoData.haVotado, usuario.uid]

            // actualizar los datos del documento con la transacción
            transaction.update(docRef, {
                votos: nuevoTotal,
                haVotado: votantes
            })

            // actualizar state
            setProducto({
                ...producto,
                votos: nuevoTotal
            })
        })

        setConsultarDB(true) // al registrar voto, se consulta a la bdd
    }

    // Crear comentarios
    const nuevoComentario = e => {
        setComentario({
            ...comentario,
            [e.target.name] : e.target.value
        })
    }

    // identifica si el comentario es del creador del producto
    const esCreador = id => {
        if(creador.id === id) {
            return true
        }
    }

    const agregarComentario = async e => {
        e.preventDefault()

        if(!usuario) {
            return router.push('/iniciar-sesion')
        }

        // información extra al comentario
        comentario.usuarioId = usuario.uid
        comentario.usuarioNombre = usuario.displayName

        // tomar copia de comentarios y agregarlos al arreglo
        const comentariosNuevos = [...comentarios, comentario]

        // actualizar la bdd
        const docRef = await doc(collection(db, "productos"), id)
        updateDoc(docRef, {
            comentarios: comentariosNuevos
        })

        // actualizar el state
        setProducto({
            ...producto,
            comentarios: comentariosNuevos
        })
        setConsultarDB(true) // al registrar comentario, se consulta a la bdd
    }

    // funcion que revisa que el creador del producto sea el mismo que esta autenticado
    const puedeBorrar = () => {
        if(!usuario) return false

        if(creador.id === usuario.uid) {
            return true
        }
    }

    // elimina un producto de la bdd
    const eliminarProducto = async () => {
        if(!usuario) {
            return router.push('/iniciar-sesion')
        }
        if(creador.id !== usuario.uid) {
            return router.push('/')
        }

        try {
            const productoRef = await doc(collection(db, "productos"), id) 
            const eliminar = confirm("¿Realmente quieres eliminar este producto?")
            if(eliminar) {
                await deleteDoc(productoRef)
                router.push('/')
            }

        } catch (error) {
            console.error(error)
        }
    }

  return (
    <Layout>
        <>
            { error ? <Error404 /> : (
                <div className='contenedor'>
                <h1 css={css`
                        text-align: center;
                        margin-top: 5rem;
                    `}
                >{nombre}</h1>
                <ContenedorProducto>
                    <div>
                        <p>Publicado hace: {formatDistanceToNow( new Date(creado), {locale: es} )}</p>
                        <p>Por: {creador.nombre} de {empresa}</p>
                        <img src={urlImagen} />
                        <p>{descripcion}</p>

                        {usuario && (
                            <>
                                <h2>Agrega tu comentario</h2>
                                <form
                                onSubmit={agregarComentario}
                                >
                                    <Campo>
                                        <input
                                            type='text'
                                            name='mensaje'
                                            onChange={nuevoComentario}
                                        />
                                    </Campo>
                                    <InputSubmit
                                        type='submit'
                                        value='Agregar Comentario'
                                    />
                                </form>
                            </>
                        )}

                        <h2 css={css`
                            margin: 2rem 0;
                        `                        
                        }>Comentarios</h2>

                        {comentarios.length === 0 ? 'Aún no hay comentarios' : (
                            <ul>
                                {comentarios.map((comentario, i) => (
                                <li
                                    key={`${comentario.usuarioId}-${i}`}
                                >
                                    <p>{comentario.mensaje}</p>
                                    <p>Escrito por:
                                        <span>{''} {comentario.usuarioNombre}</span>
                                    </p>
                                    {esCreador(comentario.usuarioId) && <CreadorProducto>Es Creador</CreadorProducto>}
                                </li>
                                    
                                ))}
                            </ul>
                        )}

                    </div>

                    <aside>
                        <Link href={url} target='_blank'>
                            <Boton
                                bgColor='true'
                            >Visitar URL</Boton>
                        </Link>                        

                        <div>
                            <p>{votos} Votos</p>
                            { usuario && (
                                <Boton
                                    onClick={votarProducto}
                                >
                                    Votar
                                </Boton>
                            )}
                        </div>
                    </aside>
                </ContenedorProducto>
                { puedeBorrar() && 
                    <Boton
                        onClick={eliminarProducto}
                    >Eliminar Producto</Boton>
                }
            </div>
            )}

            

        </>
    </Layout>
  )
}
