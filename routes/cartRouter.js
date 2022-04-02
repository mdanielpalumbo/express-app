const express = require('express')
const Contenedor = require('../files/files')


const carts = new Contenedor('./files/carts')
const prods = new Contenedor('./files/prods')

let pLen = 0
let cLen = 0
let cCont = []
let pCont = []
const cartRouter = express.Router()

cartRouter.use(
    express.json(),

    express.urlencoded({extended:true}),

    async (req,res,next) => {
        cCont = await carts.getAll()
        pCont = await prods.getAll()
        cLen = cCont.length
        pLen = pCont.length
        next()

    } 
)

cartRouter.post('/', async (req,res) => {
    let cart = {
        timestamp: Date.now(),
        id: 0,
        productos: []
    }

    const id = await carts.save(cart)
    cart = await carts.getById(id)
    res.json(cart)

})

cartRouter.get('/:id?', async(req,res) => {
    const id = req.params.id

    if(!id){
        const c = await carts.getAll()
        res.json(c)

    }else{
        if(isNaN(id) || id < 1 || id > cLen){
            res.json({Error: 'Parámetro fuera de rango (id)'})

        }else{
            const cart = await carts.getById(id)
            res.json(cart)

        }
    }

})

cartRouter.get('/:id/productos', async(req,res) => {
    const id = req.params.id
    if(isNaN(id) || id < 1 || id > cLen){
        res.json({Error: 'Parámetro fuera de rango (id)'})
    }else{
        let cart = await carts.getById(id)
        res.json(cart.productos)
    }
})

cartRouter.post('/:id/productos', async (req,res) => {
    let id = {...req.body}
    let prod = await prods.getById(id.id)
    let cart = await carts.getById(req.params.id)
    if(prod&&cart){
        let pre = cart.productos.findIndex(p => p.id == prod.id)
        if(pre != -1){
            cart.productos[pre].cantidad += 1
            await carts.actById(req.params.id, cart)
            console.log(`Cantidad de producto id ${prod.id} en carrito +1`)
        }else{
            prod.cantidad = 1
            cart.productos.push(prod)
            await carts.actById(req.params.id, cart)
            console.log(`producto de id ${prod.id} agregado con exito al carrito`)
        }
        cart = await carts.getAll()
        res.json(cart)
    }else{
        res.json({Error:"id enviado en el body es invalido"})
    }
    
})

cartRouter.delete('/:id/productos/:id_prod', async (req,res) => {      
    try{

        let cart = await carts.getById(req.params.id)
        let prod = await prods.getById(req.params.id_prod)
        if(prod&&cart){
            let pre = cart.productos.findIndex(p => p.id == prod.id)
            console.log(pre)
            if(pre != -1){
                if(cart.productos[pre].cantidad == 1){
                    cart.productos.splice(pre,1)
                    await carts.actById(req.params.id, cart)
                    res.json(cart)
                }else{
                    cart.productos[pre].cantidad -= 1
                    await carts.actById(req.params.id, cart)
                    console.log(`Eliminada 1 unidad del producto de id ${prod.id} del carrito`)
                    res.json(cart)
                }
            }else{
                res.json({Error:'El producto no se encuentra en el carrito'})
            }
        }else{
            res.json({Error:'parametros enviados invalidos'})
        }
    }catch(error){
        res.json(error)
    }
})
module.exports = cartRouter