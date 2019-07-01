import React from "react";

const Filter = ({ value, onChange }) => {
  const handleFilterChange = event => {
    onChange(event.target.value);
  };
  return (
    <div>
      filter shown with: <input value={value} onChange={handleFilterChange} />
    </div>
  );
};

export default Filter;
