import React, { useState, useEffect, useCallback, useRef } from "react";

import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import NotificationList from "./components/NotificationList";
import phonebookService from "./services/phonebookService";

const App = () => {
  const [persons, setPersons] = useState([]);

  const compareByPersonName = (p1, p2) => p1.name.localeCompare(p2.name);

  const setPersonsSorted = useCallback(
    persons => setPersons([...persons].sort(compareByPersonName)),
    [setPersons]
  );

  const notificationsRef = useRef(null);
  // these 2 callbacks will hide that the ref is used
  // and they will make the usage more expressive
  const showError = useCallback(m => notificationsRef.current.showError(m), [
    notificationsRef
  ]);
  const showMessage = useCallback(
    m => notificationsRef.current.showMessage(m),
    [notificationsRef]
  );

  const [filter, setFilter] = useState("");
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  useEffect(() => {
    phonebookService
      .getAll()
      .then(setPersonsSorted)
      .catch(error => {
        showError(`Can't fetch persons. ${error}`);
      });
  }, [setPersonsSorted, showError]);

  const validateInput = () => {
    if (!newName) {
      showError("Name can't be empty");
      return false;
    }
    if (!newNumber) {
      showError("Number can't be empty");
      return false;
    }
    if (persons.find(p => p.name === newName && p.number === newNumber)) {
      notificationsRef.current.showError(
        `${newName} with number ${newNumber} is already in the phonebook.`
      );
      return false;
    }
    return true;
  };

  const checkHandle404Error = (error, name, id) => {
    if (error.isAxiosError && error.response && error.response.status === 404) {
      showError(
        `Information of ${name} has already been removed from the server.`
      );
      setPersons(persons.filter(p => p.id !== id));
      return true;
    }
    return false;
  };

  const checkHandleValidationError = error => {
    if (error.isAxiosError && error.response && error.response.status === 400) {
      showError(
        (error.response.data && error.response.data.error) || error.message
      );
      return true;
    }
    return false;
  };

  const checkUpdateExistingNumber = () => {
    const personByName = persons.find(p => p.name === newName);
    const personByNumber = persons.find(p => p.number === newNumber);
    if (personByName && personByNumber) {
      showError(
        `There is already person with name ${newName} (number ${personByName.number}) and there is already number ${newNumber} (belonging to ${personByNumber.name})`
      );
      return true;
    }
    if (!personByName && !personByNumber) {
      return false;
    }
    if (
      personByName &&
      !window.confirm(
        `Name ${newName} is already in the phonebook.\nDo you want to update the number to ${newNumber}?`
      )
    ) {
      return false;
    }
    if (
      personByNumber &&
      !window.confirm(
        `Number ${newNumber} is already in the phonebook.\nDo you want to update the name to ${newName}?`
      )
    ) {
      return false;
    }
    const p = personByName || personByNumber;
    const id = p.id;
    phonebookService
      .put(id, { ...p, name: newName, number: newNumber })
      .then(updatedPerson => {
        setPersons(persons.map(p => (p.id !== id ? p : updatedPerson)));
        setNewName("");
        setNewNumber("");
        showMessage(`Updated ${p.name}'s number`);
      })
      .catch(error => {
        if (checkHandle404Error(error, p.name, id)) {
          setNewName("");
          setNewNumber("");
        } else {
          if (!checkHandleValidationError(error)) {
            showError(
              `Failed to update ${p.name}'s number on the server. ${error}`
            );
          }
        }
      });
    return true;
  };

  const handleNameSubmit = event => {
    event.preventDefault();
    if (!validateInput()) {
      return;
    }
    if (checkUpdateExistingNumber()) {
      return;
    }
    const newPerson = { name: newName, number: newNumber };
    phonebookService
      .create(newPerson)
      .then(newPerson => {
        showMessage(`Added ${newPerson.name}`);
        setPersonsSorted(persons.concat(newPerson));
        setNewName("");
        setNewNumber("");
      })
      .catch(error => {
        if (!checkHandleValidationError(error)) {
          showError(`Failed to add ${newPerson.name}. ${error}`);
        }
      });
  };

  const handleDelete = id => {
    if (!window.confirm("Are you sure?")) return;
    let person = persons.find(p => p.id === id);
    phonebookService
      .del(id)
      .then(() => {
        showMessage(`Removed ${person.name} successfully`);
        setPersons(persons.filter(p => p.id !== id));
      })
      .catch(error => {
        if (!checkHandle404Error(error, person.name, id)) {
          showError(
            `Failed to remove ${person.name} from the server. ${error}`
          );
        }
      });
  };

  let filteredPersons = persons;
  if (filter) {
    filteredPersons = persons.filter(
      p => p.name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1
    );
  }

  return (
    <div>
      <NotificationList ref={notificationsRef} />
      <h2>Phonebook</h2>
      <Filter value={filter} onChange={setFilter} />
      <h3>add a new</h3>
      <PersonForm
        name={newName}
        number={newNumber}
        onNameChange={setNewName}
        onNumberChange={setNewNumber}
        onSubmit={handleNameSubmit}
      />
      <h3>Numbers</h3>
      <Persons list={filteredPersons} onDelete={handleDelete} />
    </div>
  );
};

export default App;
