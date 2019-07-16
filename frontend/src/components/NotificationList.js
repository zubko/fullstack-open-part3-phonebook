import React from "react";

import Notification from "./Notification";

const NOTIFICATION_VISIBLE_TIME = 5000;

// Class component is better here because we need to provide
// imperative APIs showError() showMessage() to the client
// of this component.
// Also setTimeout + conventional setState are less bug prone
// with hooks, the handler of `setTimeout` will capture the state
// at the moment of the closure's creation, which isn't what is
// needed here.
export default class Notifications extends React.Component {
  lastNotificationId = 0;

  state = {
    messages: []
  };

  addItem(text, isError) {
    let id = this.lastNotificationId++;
    this.setState(state => ({
      messages: state.messages.concat({ id, text, isError })
    }));
    setTimeout(() => {
      this.setState(state => ({
        messages: state.messages.filter(m => m.id !== id)
      }));
    }, NOTIFICATION_VISIBLE_TIME);
  }

  showMessage(message) {
    this.addItem(message, false);
  }

  showError(message) {
    this.addItem(message, true);
  }

  render() {
    const { messages } = this.state;
    return (
      <div style={{ position: "fixed", top: 0, left: 0 }}>
        {messages.slice(-4).map(m => (
          <Notification key={m.id} message={m.text} isError={m.isError} />
        ))}
      </div>
    );
  }
}
