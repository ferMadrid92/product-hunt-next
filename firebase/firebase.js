import { initializeApp } from "firebase/app"
import firebaseConfig from "./config"
import {
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "@firebase/auth"
import "firebase/firestore"
import { getFirestore } from 'firebase/firestore'
import { getStorage } from '@firebase/storage';

class Firebase {
  constructor() {
    const app = initializeApp(firebaseConfig)
    this.auth = getAuth(app)
    this.db = getFirestore(app)
    this.storage = getStorage(app)
  }

  // Registra un usuario
  async registrar(nombre, email, password) {
    const { user } = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    )
    return await updateProfile(user, {
      displayName: nombre,
    })
  }

  // Inicia sesión del usuario
  async login(email, password) {
    return  await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      )
  }

  // Cierra la sesión del usuario
  async cerrarSesion() {
    await signOut(this.auth)
  }
}

const firebase = new Firebase()

export default firebase
