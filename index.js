const express = require("express");
const session = require("express-session");
const app = express();
const bodyParser = require("body-parser"); //Importando Body Parser
const connection = require("./database/database.js");

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./user/UsersController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./user/Users");

//View Engine
app.set('view engine', 'ejs');

//Sessions
app.use(session({
    secret: "youshallnotpass", cookie: { maxAge: 30000000},
    saveUninitialized: true,
    resave: true
}))

//Arquivos estaticos
app.use(express.static('public'));

//BodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Database
connection.authenticate()
    .then(()=>{
        console.log("Conexão feita com o banco de dados!")
    })
    .catch((msgErro)=>{
        console.log(msgErro);
    })

app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

app.get("/", (req,res)=>{
    Article.findAll({
        order:[
            ['id','DESC']
        ],
        limit: 4
    }).then(articles=>{
        Category.findAll().then(categories=>{
            res.render("index",{articles:articles, categories:categories});
        });
    });
})

app.get("/:slug", (req,res)=>{
    var slug = req.params.slug;
    Article.findOne({
        where:{
            slug:slug
        }
    }).then(article=>{
        if(article!=undefined){
            Category.findAll().then(categories=>{
                res.render("article",{article:article, categories:categories});
            });
        }else{
            res.redirect("/");
        }
    }).catch( err=>{
        res.redirect("/");
    });
})

app.get("/category/:slug", (req,res)=>{
    var slug = req.params.slug;
    Category.findOne({
        where:{
            slug:slug
        },
        include: [{model: Article}]
    }).then(category=>{
        if(category!=undefined){
            Category.findAll().then(categories=>{
                res.render("index",{articles:category.articles, categories:categories});
            });
        }else{
            res.redirect("/");
        }
    }).catch( err=>{
        res.redirect("/");
    });
})

app.listen(8080, ()=>{
    console.log("Servidor rodando!");
})