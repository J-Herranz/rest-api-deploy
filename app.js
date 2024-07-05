const express = require('express') // require -> commonJS
const crypto = require('node:crypto')
const cors = require('cors')

const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./Schemas/movies')

const app = express()
app.use(express.json()) // Middleware

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com'
    ]
  
    if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
})) // Middleware

//app.use(cors())

app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express

// Todos los recursos que sean MOVIES se idenfica con /movies
app.get('/movies', (req, res) => {
  
/*
// No necesario por la utilisation del Middleware CORS
  const origin = req.header('origin')
  // cuando la petición des del mismo ORIGIN
  // http://localhost:1234 -> http://localhost:1234
  // el servidor NO envía NUNCA el header de origin
  if(ACCEPTED_ORIGINS.includes(origin) || !origin){
    res.header('Access-Control-Allow-Origin', origin)
  }
*/

  const { genre } = req.query
  if(genre){
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)

  return movie ? res.json(movie) : res.status(404).json({ message: 'movie not found'})
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body) // acceder al req.body necesita del middleware app.use(express.json())

  // O también !result.success
  if(result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data // NO ES LO MISMO QUE ...req.body (...result.data son datos validados)
  }

  // Esto no sería REST, porque estamos guardando
  // el estado de la aplicación en memoria
  movies.push(newMovie)
  res.status(201).json(newMovie) // actualizar la caché del cliente
})

app.delete('/movies/:id', (req, res) => {
  /*
  // No necesario por la utilisation del Middleware CORS
  const origin = req.header('origin')
  if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  */

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if(movieIndex === -1) {
    return res.status(404).json({message: 'Movie not found'})
  }

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted'})
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if(!result.success){
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if(movieIndex === -1) {
    return res.status(404).json({message: 'Movie not found'})
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie

  return res.json(updatedMovie)
})


/*
// No necesario por la utilisation del Middleware CORS
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }
  res.send(200)
})
*/

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})
