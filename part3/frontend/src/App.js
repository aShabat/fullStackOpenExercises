import { useState, useEffect } from 'react'
import SearchForm from './components/SearchForm'
import AddPersonForm from './components/AddPersonForm'
import Numbers from './components/Numbers'
import Notification from './components/Notification'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchString, setSearchString] = useState('')
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    console.log('effect')
    personService
      .getAllPersons()
      .then(newPersons => setPersons(newPersons))
  }, [])

  const handleError = (error) => {
    setMessage(error.response.data.error)
    setIsError(true)
    setTimeout(() => {
      setMessage(null)
    }, 5000)

    personService
      .getAllPersons()
      .then(newPersons => setPersons(newPersons))
  }

  const addPerson = (event) => {
    event.preventDefault()
    const newPerson = { name: newName, number: newNumber }
    if (persons.findIndex(({ name }) => name === newName) !== -1) {
      if (!window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) return
      const id = persons.find(person => person.name === newName).id
      personService
        .updatePerson(id, newPerson)
        .then(updatedPerson => {
          setPersons(persons.map(person => person.id !== id ? person : updatedPerson))
          setNewName('')
          setNewNumber('')

          setMessage(`Changed number of ${newName}`)
          setIsError(false)
          setTimeout(() => {
            setMessage(null)
          }, 5000);
        })
        .catch(error => handleError(error))
    } else {
      personService
        .createPerson(newPerson)
        .then(newPerson => {
          setPersons(persons.concat(newPerson))
          setNewName('')
          setNewNumber('')
      
          setMessage(`Added ${newName}`)
          setIsError(false)
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(error => handleError(error))
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearchString(event.target.value)
  }

  const handleDeleteOf = (id) => {
    return () => {
      if (!window.confirm(`Delete ${persons.find(person => person.id === id).name}?`)) return 
      personService
        .deletePerson(id)
        .then(deletedPerson => {
          setPersons(persons.filter(person => person.id !== id))
          setMessage(`${persons.find(person => person.id === id).name} has been deleted`)
          setIsError(false)
          setTimeout(() => {
            setMessage(null)
          }, 5000);
        })
        .catch(error => handleError(error))
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} isError={isError} />
      <SearchForm searchString={searchString} handleSearchChange={handleSearchChange} />
      <h2>add a new</h2>
      <AddPersonForm newName={newName} newNumber={newNumber} 
                     handleNameChange={handleNameChange} handleNumberChange={handleNumberChange}
                     onSubmit={addPerson} />
      <h2>Numbers</h2>
      <Numbers persons={persons} searchString={searchString} handleDeleteOf={handleDeleteOf} />
      {/* {persons
        .filter(searchString === '' 
          ? (person) => true
          : (person) => person.name.toLowerCase().includes(searchString.toLowerCase()))
        .map(person => <p key={person.id}>{person.name} {person.number}</p>)} */}
    </div>
  )
}

export default App