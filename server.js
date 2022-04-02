const express = require('express')
const cartRouter = require('./routes/cartRouter')
const prodsRouter = require('./routes/prodsRouter')
const app = express()


app.use('/api/carrito', cartRouter)
app.use('/api/productos', prodsRouter)

app.listen(8080, () => {
    console.log('servidor conectado correctamente y escuchando el puerto 8080')
})

