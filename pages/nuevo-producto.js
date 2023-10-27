import React, { useState, useContext } from 'react'
import { css } from '@emotion/react'
import Router, {useRouter} from 'next/router'
import Layout from '../components/layout/Layout'
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/Formulario'
import Error404 from '../components/layout/404'
//firebase
import { FirebaseContext } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, getDownloadURL, uploadBytesResumable } from '@firebase/storage'

// validaciones
import useValidacion from '../hooks/useValidacion'
import validarCrearProducto from '../validacion/validarCrearProducto'

const STATE_INICIAL = {
  nombre: '',
  empresa: '',
  //imagen: '',
  url: '',
  descripcion: ''
}

export default function NuevoProducto() {

  const [error, setError] = useState(false)
  // States para la subida de la imagen
  const [uploading, setUploading] = useState(false)
  const [urlImagen, setUrlImagen] = useState('')

  const { valores, errores, handleSubmit, handleChange, handleBlur } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto)

  const {nombre, empresa, imagen, url, descripcion} = valores

  // hook de routing para redireccionar
  const router = useRouter()

  // context con las operaciones crud de firebase
  const { usuario, firebase } = useContext(FirebaseContext)
  const {db} = firebase

  async function crearProducto() {
    // si usuario no autenticado, llevar al login
    if(!usuario) {
      return router.push('/iniciar-sesion')
    }

    // crear el objeto de nuevo producto
    const producto = {
      nombre,
      empresa,
      urlImagen,
      url,
      descripcion,
      votos: 0,
      comentarios: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName
      },
      haVotado: []
    }

    // insertarlo en la base de datos
    try {     
      
      await addDoc(collection(db, 'productos'), producto)
      return router.push('/')
    } catch (error) {
        console.error(error)
    }
  }

  const handleImageUpload = e => {
    // Se obtiene referencia de la ubicación donde se guardará la imagen
    const file = e.target.files[0]
    const imageRef = ref(firebase.storage, 'products/' + file.name)

    // Se inicia la subida
    setUploading(true)
    const uploadTask = uploadBytesResumable(imageRef, file)

    // Registra eventos para cuando detecte un cambio en el estado de la subida
    uploadTask.on('state_changed', 
        // Muestra progreso de la subida
        snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log(`Subiendo imagen: ${progress}% terminado`)
        },
        // En caso de error
        error => {
            setUploading(false)
            console.error(error)
        },
        // Subida finalizada correctamente
        () => {
            setUploading(false)
            getDownloadURL(uploadTask.snapshot.ref).then(url => {
                console.log('Imagen disponible en:', url)
                setUrlImagen(url)
            })
        }
    )
}
const nuevoProducto = true

  return (
    <Layout>
      { !usuario ? <Error404 nuevoProducto={nuevoProducto}/> : (
        <>
        <h1
          css={css`
            text-align: center;
            margin-top: 5rem;
          `}
        >Nuevo Producto</h1>
        <Formulario
          onSubmit={handleSubmit}
          noValidate
        >

        <fieldset>
            <legend>Información General</legend>
          

          <Campo>
            <label htmlFor='nombre'>Nombre</label>
            <input
              type='text'
              id='nombre'
              placeholder='Nombre del Producto'
              name='nombre'
              value={nombre}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.nombre && <Error>{errores.nombre}</Error>}

          <Campo>
            <label htmlFor='empresa'>Empresa</label>
            <input
              type='text'
              id='empresa'
              placeholder='Nombre empresa o Compañia'
              name='empresa'
              value={empresa}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.empresa && <Error>{errores.empresa}</Error>}

          <Campo>
            <label htmlFor='imagen'>Imagen</label>
            <input
              accept="image/*"
              type='file'
              id='imagen'
              name='imagen'
              value={imagen}
              onChange={handleImageUpload}
            />
          </Campo>
          {errores.imagen && <Error>{errores.imagen}</Error>}

          <Campo>
            <label htmlFor='url'>URL</label>
            <input
              type='url'
              id='url'
              name='url'
              placeholder='URL de tu producto'
              value={url}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.url && <Error>{errores.url}</Error>}

        </fieldset>
        <fieldset>
          <legend>Sobre tu Producto</legend>
          <Campo>
            <label htmlFor='descripcion'>Descripción</label>
            <textarea
              id='descripcion'
              name='descripcion'
              value={descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.descripcion && <Error>{errores.descripcion}</Error>}
        </fieldset>

          {error && <Error>{error}</Error>}

          <InputSubmit
            type='submit'
            value='Crear Producto'
          />

        </Formulario>
      </>
      )}
      
    </Layout>
  )
}
