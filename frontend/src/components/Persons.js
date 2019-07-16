import * as React from "react";

const Person = ({ name, number, onDelete }) => (
  <div>
    {name}: {number} <button onClick={onDelete}>delete</button>
  </div>
);

export default ({ list, onDelete }) => [
  list.map(p => (
    <Person
      key={p.id}
      name={p.name}
      number={p.number}
      onDelete={() => onDelete(p.id)}
    />
  ))
];
