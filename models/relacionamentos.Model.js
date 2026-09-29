const sequelize = require('../config/bd');
const Filme = require('./filme.Model');
const Diretor = require('./diretor.Model');
const Artista = require('./artista.Model');

Diretor.hasMany(Filme, {
  foreignKey: 'diretorId',
  as: 'filmes'
});

Filme.belongsTo(Diretor, {
  foreignKey: 'diretorId',
  as: 'diretor'
});

Artista.belongsToMany(Filme, {
  through: 'FilmeArtista',
  foreignKey: 'artistaId',
  as: 'filmes'
});

Filme.belongsToMany(Artista, {
  through: 'FilmeArtista',
  foreignKey: 'filmeId',
  as: 'artistas'
});