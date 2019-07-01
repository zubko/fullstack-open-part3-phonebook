import React from "react";

const Notification = ({ message, isError }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        color: isError ? "red" : "green",
        border: "0.2em solid currentColor",
        borderRadius: "0.3em",
        fontSize: "125%",
        padding: "0.3em 0.5em",
        backgroundColor: "white",
        margin: "0.5em 0.5em"
      }}
    >
      {message}
    </div>
  );
};

export default Notification;
