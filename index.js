require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const errorHandler = (error, request, response, next) => {
    console.error("errorHandler", error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))



let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

app.get('/api/info', (request, response) => {
    response.send(`Phonebook has info for ${persons.length} people <br></br>${Date()}`)
})

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})
//id:n avulla haettavan kontaktin route
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})
//id:n avulla haettavan kontaktin poiston route
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


const generateId = () => {
    const newId = Math.floor((Math.random() * 1000) + 1)
    return newId
}

//kontaktien lisäykseen käytettävä route

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    //käydään tietokanta läpi ja tallennetaan tiedot muuttujaan, jos täydellinen mätsi löydetään
    /* kommentoitu duplikaattien tarkistus pois tehtävä 3.13...
    const notSoUnique = persons.find(person => person.name === body.name)
    //testataan löytyykö ja palautetaan sopiva status error viesteineen
     
        if (notSoUnique) {
            return response.status(400).json({
                error: 'name must be unique'
            })
        }
    */

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedContact => {
            response.json(savedContact)
        })
})

//kontaktin päivityksen route
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person)
        .then(updatedContact => {
            response.json(updatedContact)
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})