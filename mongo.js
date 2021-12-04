const mongoose = require('mongoose');

if (process.argv.length < 3) {
	console.log('Please provide the password as an argument: node mongo.js <password>');
	process.exit(1);
}

const password = process.argv[2];

const url =
  `mongodb+srv://admin:${password}@cluster0.r0mb0.mongodb.net/phonebook-app?retryWrites=true&w=majority`;



mongoose.connect(url);

const personSchema = new mongoose.Schema({
	name: String,
	number: String, 
});

const Person = mongoose.model('Person', personSchema);



if(process.argv.length === 3){
	Person.find({}).then(result => {
		result.forEach(person => {
			console.log(person);
		});
		mongoose.connection.close();
		process.exit(1);
	});
}else{
	const person = new Person({
		name:  process.argv[3],
		number:  process.argv[4],
	});


	person.save().then(() => {
		console.log('person saved!');
		mongoose.connection.close();
		process.exit(1);
	});


}





