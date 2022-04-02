const express = require('express')
const Contenedor = require('../files/files')

const prods = new Contenedor('./files/prods')
const carts = new Contenedor('./files/carts')

let admin = true
let len = 0
let cont = []

const prodsRouter = express.Router()

prodsRouter.use(
    express.json(),
    express.urlencoded({extended: true}),
    async (req, res, next)=>{
        cont = await prods.getAll()
        len = cont.length
        next()
    }
)

prodsRouter.get('/:id?', async (req,res) => {
    const id = req.params.id
    if(!id){
        const p = await prods.getAll()
        res.send(p)
    }else{
        if(isNaN(id) || id < 1 || id > len){
            res.json({error: 'Parámetro fuera de rango (id)'})
        }else{
            const p = await prods.getById(id)
            res.json(p)
        }
    }
    
})

prodsRouter.post('/', async (req,res) => {
    if(admin){
        const prod = {...req.body}
        prod.timestamp = Date.now()
        await prods.save(prod)
        res.json(prod)
    }else{
        res.json({error: '-1', descripcion:'ruta:api/productos método: post no autorizada'})

    }
})

prodsRouter.put('/:id', async (req,res) => {
    if(admin){
        try{
            let { id } = req.params
            let prod = {...req.body}
            prod.timestamp = Date.now()
            if ( isNaN(id) || id < 1 || id > len){
                res.json({error: 'producto no encontrado'})
            }else{ 
                await prods.actById(id, prod)
                res.json(prod)
            }
        }catch(err){
            console.log(err)
        }
    }else{
        res.json({error: -1, descripcion:'ruta api/productos método: put no autorizada'})
    }    
})

prodsRouter.delete('/:id', async (req,res) => {
    if(admin){
        let { id } = req.params
        if ( isNaN(id) || id < 1 || id > len){
            res.json({Error: 'parámetro fuera de rango (id)'})
        }else{
            await prods.deleteById(id)
            res.json({Error:`Archivo de ID ${id} eliminado con éxito`})
        }
    }else{
        res.json({error: -1, descripcion:'ruta:api/productos método: delete no autorizada'})
    }
})

module.exports = prodsRouter, prods
