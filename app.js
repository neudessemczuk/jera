//Imports
require('dotenv').config()
const express =  require('express')
const mongoose = require('mongoose')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

// Config resposta JSON - Possibilita o express ler JSON
app.use(express.json())

//Models
 const User = require('./models/User')

//Open Route - Public Route
app.get('/',(req, res)=> {
    res.status(200).json({msg:"API ativada com sucesso!"})
})

// Private Route
app.get('/user/:id', checkToken, async (req, res)=>{
    const id = req.params.id

    //Checar se usuario existe
    const user = await User.findById(id, "-senha")

    if(!user){
        return res.status(404).json({msg:"Usuário não encontrado"})
    }
    
    res.status(200).json({ user })
})

function checkToken(req, res, next){
    const authHeader = req.headers ['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({msg: "Acesso negado!"})
    }

    try{
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
        
    } catch(error){
        res.status(400).json({msg:"Token inválido!"})
    }
}
//Registro de Usuário
app.post('/auth/register', async(req, res)=>{
    const{nome, email, senha, confirmacaoSenha, dataNasc} = req.body

    //Validações
    if(!nome){
        return res.status(422).json({msg: "Nome é obrigatório!"})
    }
    if(!email){
        return res.status(422).json({msg: "Email é obrigatório!"})
    }
    if(!dataNasc){
        return res.status(422).json({msg: 'Data de nascimento é obrigatório!'})
    }

    if(!senha){
        return res.status(422).json({msg: "Senha é obrigatória!"})
    }
    if(senha !== confirmacaoSenha){
        return res.status(422).json({msg: 'As senhas não conferem!'})
    }
   

    // Verificar se usuario existe
    const userExists = await User.findOne({email: email})
    
    if(userExists) {
        return res.status(422).json({msg: 'Por favor, utilize um email diferente!'})
    }

    //Criando senha
    const salt = await bcrypt.genSalt(12)
    const senhaHash = await bcrypt.hash(senha, salt)

    // Criar Usuario
    const user = new User({
        nome,
        email,
        senha: senhaHash,
        dataNasc
    })

    try{
        await user.save()

        res.status(201).json({msg: "Usuário criado com sucesso!"})

    } catch(error) {
        console.log(error)
        res.status(500)
        .json({
            msg: "Aconteceu um erro no servidor, tente novamente mais tarde"
        })
    }
})
// Login Usuario
app.post("/auth/login", async (req, res)=>{
    const{email, senha} = req.body

    //Validação
    if(!email){
        return res.status(422).json({msg: "Email é obrigatório!"})
    }
    if(!senha){
        return res.status(422).json({msg: "Senha é obrigatória!"})
    }

    // Checar se usuário existe
    const user = await User.findOne({email: email})
    
    if(!user) {
        return res.status(404).json({msg: 'Usuário não encontrado!'})
    }

    // Checar se a senha coincide
    const checkSenha = await bcrypt.compare(senha, user.senha)

    if(!checkSenha) {
        return res.status(422).json({msg: 'Senha inválida'})
    }
    try{
        const secret = process.env.SECRET
        const token = jwt.sign(
            {
            id: user._id,
            },
            secret,
    )

    res.status(200).json({msg:"Autenticação realizada com sucesso!", token})
    } catch(err){
        console.log(error)

        res.status(500)
        .json({
            msg: "Aconteceu um erro no servidor, tente novamente mais tarde"
        })
    }



})
//Credenciais
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS


mongoose
.connect(
    `mongodb+srv://${dbUser}:${dbPass}@projetojera.hgtne3b.mongodb.net/?retryWrites=true&w=majority&appName=projetojera`
)
.then(() => {
    app.listen(3000)
    console.log('Conectou ao Banco!')
})
.catch((err) => console.log(err))