
export default function validarCrearProducto(valores) {
    let errores = {}

    // Validar el nombre del usuario
    if(!valores.nombre) {
        errores.nombre = "El Nombre es obligatorio"
    }

    // Validar empresa
    if(!valores.empresa) {
        errores.empresa = "Nombre de Empresa es obligatorio"
    }

    // Validar url
    if(!valores.url) {
        errores.url = 'La URL del producto es obligatoria'
    } else if(!/^(ftp|http|https):\/\/[^ "]+$/.test(valores.url)) {
        errores.url = 'URL no válida'
    }

    // Validar descripción
    if(!valores.descripcion) {
        errores.descripcion = 'Agrega una descripcion de tu producto'
    }

    return errores
}
