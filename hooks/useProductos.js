import React, { useContext, useEffect, useState } from 'react'
import { FirebaseContext } from "../firebase"
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export default function useProductos(orden) {
    
  const [productos, setProductos] = useState([])
 
  const { firebase } = useContext(FirebaseContext)

  const { db } = firebase

  useEffect(() => {
    const obtenerProductos = async () => {
      // consulta que ordena los productos por votos de forma descendente
      const q = query(collection(db, "productos"), orderBy(orden, "desc"))
      //documentos que corresponden con la consulta
      const querySnapshot = await getDocs(q)
      const productos = querySnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        }
      })
      setProductos(productos)
    }
    obtenerProductos()
  }, [])

  return { productos }
}

