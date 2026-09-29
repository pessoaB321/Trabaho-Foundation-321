const express = require('express');
const exphbs = require('express-handlebars');
const sequelize = require('./config/bd');
const Filme = require('./models/filme.Model');
const Diretor = require('./models/diretor.Model');
const Artista = require('./models/artista.Model');
require('./models/relacionamentos.Model');
const path = require('path');
 //npm install express express-handlebars sequelize sqlite3
 //npm install foundation-sites jquery

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.engine('handlebars', exphbs.engine({ defaultLayout: 'main',
  helpers: {
      eq: function (v1, v2) {
        return v1 == v2; 
      }
  }
}));
app.set('view engine', 'handlebars');
//negocio do f

app.use('/css', express.static(path.join(__dirname, 'node_modules/foundation-sites/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/foundation-sites/dist/js')));
app.use('/js/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
//A
//|
//|

//outro negocio do f
app.use('/js/what-input', express.static(
  path.join(__dirname, 'node_modules/what-input/dist')
));


app.get('/', (req, res) => res.render('home'));

app.get('/artistas', async (req, res) => {
  const artistas = await Artista.findAll({ order: [['nome', 'ASC']] });
  res.render('artistas', { artistas: artistas.map((artista) => artista.get({ plain: true })) });
});

app.post('/artistas', async (req, res) => {
  const artista = await Artista.create({
    nome: req.body.nome,
    foto: req.body.foto || null
  });
  res.redirect(`/artistas/${artista.id}`);
});

app.get('/artistas/:id', async (req, res) => {
  const artista = await Artista.findByPk(req.params.id, {
    include: [{ model: Filme, as: 'filmes' }]
  });
  if (!artista) return res.sendStatus(404);
  res.render('artistas', {
    artista: artista.get({ plain: true }),
    artistas: []
  });
});

app.get('/diretores', async (req, res) => {
  const diretores = await Diretor.findAll({ order: [['nome', 'ASC']] });
  res.render('diretores', { diretores: diretores.map((diretor) => diretor.get({ plain: true })) });
});

app.post('/diretores', async (req, res) => {
  const diretor = await Diretor.create({
    nome: req.body.nome,
    anoNascimento: req.body.anoNascimento || null
  });
  res.redirect(`/diretores/${diretor.id}`);
});

app.get('/diretores/:id', async (req, res) => {
  const diretor = await Diretor.findByPk(req.params.id, {
    include: [{ model: Filme, as: 'filmes' }]
  });
  if (!diretor) return res.sendStatus(404);
  res.render('diretores', {
    diretor: diretor.get({ plain: true }),
    diretores: []
  });
});

app.get('/filmes', async (req, res) => {
  const [filmes, diretores, artistas] = await Promise.all([
    Filme.findAll({ include: [{ model: Diretor, as: 'diretor' }], order: [['nome', 'ASC']] }),
    Diretor.findAll({ order: [['nome', 'ASC']] }),
    Artista.findAll({ order: [['nome', 'ASC']] })
  ]);
  res.render('filmes', {
    filmes: filmes.map((filme) => filme.get({ plain: true })),
    diretores: diretores.map((diretor) => diretor.get({ plain: true })),
    artistas: artistas.map((artista) => artista.get({ plain: true }))
  });
});

app.post('/filmes', async (req, res) => {
  const filme = await Filme.create({
    nome: req.body.nome,
    ano: req.body.ano || null,
    diretorId: req.body.diretorId || null
  });
  const artistaIds = req.body.artistaIds
    ? [].concat(req.body.artistaIds)
    : [];
  if (artistaIds.length) await filme.setArtistas(artistaIds);
  res.redirect(`/filmes/${filme.id}`);
});

app.get('/filmes/:id', async (req, res) => {
  const filme = await Filme.findByPk(req.params.id, {
    include: [
      { model: Diretor, as: 'diretor' },
      { model: Artista, as: 'artistas' }
    ]
  });
  if (!filme) return res.sendStatus(404);
  res.render('fichatecnica', { filme: filme.get({ plain: true }) });
});

sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('psiu, tá rodando');
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });


//http://localhost:3000

//Os nomes eram salvos no banco, mas não apareciam porque o Sequelize entregava instâncias de model ao Handlebars. Por segurança, o Handlebars bloqueia por padrão o acesso a atributos definidos no protótipo dessas instâncias.