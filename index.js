const express = require("express");
const app = express();

app.use(express.json({strict: false}));

app.use(express.static('build'));

const cors = require('cors');
app.use(cors());

const morgan = require('morgan');

morgan.token('body', function (req, res) { 
	return JSON.stringify(req.body) 
});


app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
		tokens.body(req, res)
  ].join(' ')
}));



// const requestLogger  = (request, response, next) => {
// 		console.log("method:", request.method);
// 		console.log("path", request.path);
// 		console.log("Body", request.body);
// 		console.log("-----");
// 		next();
// };

// app.use(requestLogger);

let  persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];




app.get("/api/persons", (request, response) => {
	
		response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find(p => p.id === parseInt(id));

  if(person){
			response.json(person);
	}else{
			response.status(404).end("Person not found");
	}

});


app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
	response.status(204).end();
});


const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(p => p.id))
    : 0
  return maxId + 1
}



app.post('/api/persons', (request, response) => {
		const body = request.body;

		if (!body.name) {
			return response.status(400).json({ 
				error: 'name missing' 
			});
		}

		if (!body.number) {
			return response.status(400).json({ 
				error: 'number missing' 
			});
		}


		if(persons.find(p => p.name === body.name)){
				return response.status(400).json({ 
					error: 'person already exists' 
				});
		}

		const person = {
			number: body.number,
			name: body.name ,
			id: generateId(),
		}

		persons = persons.concat(person);
  	response.json(person);
});



app.get("/info", (request, response) => {
		response.send(`
				<p>Phonebook has info for ${persons.length} people </p>
				<p> ${new Date()} </p>
		`);

});


const unknownEndpoint = (request, response) => {
		response.status(404).send({ error : 'unknown endpoint'});
};

app.use(unknownEndpoint);

const PORT  =  process.env.PORT || 3001;

app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
});
