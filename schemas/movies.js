const z = require('zod') // schema declaration and validation library (npm install zod -E)

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().positive().min(1900).max(2024),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(0),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovie (input) {
  // return movieSchema.parse(object)

  // safeParse devuelve un objeto 'result' que te dice si hay un error o hay datos
  return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
  // partial se usa en TypeScript y hace que las propiedades en movieSchema sean OPCIONALES :
  // si no está, no pasa nada. Si está, la valida como está especificado
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
