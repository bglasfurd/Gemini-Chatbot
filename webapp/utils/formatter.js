sap.ui.define([], function () {
  "use strict";
  return {
    
    messageStyle: function (sender) {
        console.log(sender);
      return sender === "You" ? "messageBox userMessage" : "messageBox botMessage";
    }
  };
});
