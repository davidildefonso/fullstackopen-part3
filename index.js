const express = require("express");
require('dotenv').config();


const Person = require('./models/person');


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






app.get("/api/persons", (request, response, next) => {	
		Person.find({}).then(person => {
				response.json(person);			
		}).catch(error => next(error) );
});

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id).then(person => {
			if(person){
					response.json(person);
			}else{
					response.status(404).end("Person not found");
			} 
  }).catch(error => next(error) );

});


app.delete('/api/persons/:id', (request, response , next) => {

		Person.findById(request.params.id)
			.then(person => {
						if(!person){
								return response.status(400).json({ 
									error: 'person not found' 
								});
						}				

						Person.findByIdAndRemove(request.params.id , function (err, note) {
							if (err) return console.log(err);
							response.status(204).end();
						});
						
			}).catch(error => next(error) );

});


app.post('/api/persons', (request, response, next) => {
		const body = request.body;

		const newPerson = new Person({
					number: body.number,
					name: body.name 		
		});

		newPerson.save().then(savedPerson => {
			response.json(savedPerson)
		}).catch (error => next(error));
	
});



app.get("/info", (request, response, next) => {

		const numPersons = Person.estimatedDocumentCount().then(num => {
				try {
						if(num === 0){
									response.send(`
											<p>Phonebook has no records </p>
											<p> ${new Date()} </p>
									`);
						}

						if(num === 1){
							response.send(`
									<p>Phonebook has info for ${num} person </p>
									<p> ${new Date()} </p>
							`);
						}

						response.send(`
								<p>Phonebook has info for ${num} people </p>
								<p> ${new Date()} </p>
						`);
					
				} catch (error) {
						 next(error);
				}
			
	
		});


});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const note = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, note, { new: true, runValidators: true })
    .then(updatedPerson => {
      	response.json(updatedPerson)
    })
    .catch(error => next(error))
})




const unknownEndpoint = (request, response) => {
		response.status(404).send({ error : 'unknown endpoint'});
};

app.use(unknownEndpoint);


const errorHandler = (error, request, response, next) => {
 console.log(error)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError'){
				if(error.path  === "name"){
						return response.status(400).json({ error: error.message })
				}
				if(error.path = "phone"){
						return response.status(400).json({ error: error.message })
				}
	}

  next(error);
}

app.use(errorHandler);





const PORT  =  process.env.PORT || 3001;

app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
});
