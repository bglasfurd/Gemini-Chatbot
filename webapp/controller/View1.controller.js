sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/core/BusyIndicator",
  "gemini/utils/formatter"
], function (Controller, JSONModel, MessageToast, BusyIndicator, formatter) {
  "use strict";

  return Controller.extend("gemini.controller.View1", {
    formatter: formatter,

    onInit: function () {
      var oModel = new JSONModel({
        loading: false,
        messages: [{
          sender: "Gemini",
          text: "Hi! What can I help you with?",
          timestamp: new Date().toLocaleTimeString()
        }]
      });
      this.getView().setModel(oModel);
    },

    getMessageFormat: function() {
      console.log("HELLO");
    },


    onPostMessage: async function (oEvent) {
      const sUserText = oEvent.getParameter("value").trim();
      const fileUploader = this.byId("fileUploader");
      const file = fileUploader.getDomRef("fu")?.files?.[0];
      const oModel = this.getView().getModel();
      const aMessages = oModel.getProperty("/messages");

      if (!sUserText && !file) {
        MessageToast.show("Please enter a message or upload a file.");
        return;
      }

      // Display user's message
      if (sUserText) {
        aMessages.push({
          sender: "You",
          text: sUserText,
          timestamp: new Date().toLocaleTimeString()
        });
        oModel.setProperty("/messages", aMessages);
        this._scrollToBottom();
      }

      try {
        oModel.setProperty("/loading", true);

        let geminiResponse;
        if (file) {
          const base64Data = await this._readFileAsBase64(file);
          geminiResponse = await this._callGeminiWithPDF(sUserText || "Summarize this document", base64Data);

          // Optional: Clear file input
          fileUploader.clear();
        } else {
          geminiResponse = await this._callGeminiAPI(sUserText);
        }

        aMessages.push({
          sender: "Gemini",
          text: geminiResponse,
          timestamp: new Date().toLocaleTimeString()
        });
        oModel.setProperty("/messages", aMessages);
        this._scrollToBottom();
        this.byId("feedInput").setValue(""); // Clear input
      } catch (err) {
        console.error("Error during Gemini call:", err);
        MessageToast.show("Failed to get response from Gemini.");
      } finally {
        oModel.setProperty("/loading", false);
      }
    },

    _readFileAsBase64: function (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    _callGeminiWithPDF: async function (userText, base64PDF) {
      const apiKey = "AIzaSyAxQT-qsn3qoXdv362Q7I4tNzb5DmwIaP4";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const body = {
        contents: [
          {
            role: "user",
            parts: [
              { text: userText },
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64PDF
                }
              }
            ]
          }
        ]
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      console.log("Gemini PDF result:", result);

      return result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    },


    _callGeminiAPI: async function (userText) {
  const oModel = this.getView().getModel();
  oModel.setProperty("/loading", true);

  try {
    // Load API key from apikey.json (asynchronously)
    const responseKey = await fetch("config/apikey.json");
    if (!responseKey.ok) {
      throw new Error("Failed to load API key");
    }

    const data = await responseKey.json();
    const apiKey = data.API_KEY;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Call Gemini API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userText }]
          }
        ]
      })
    });

    const result = await response.json();
    console.log("Gemini text result:", result);

    return result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

  } catch (err) {
    console.error("API error:", err);
    return "Failed to generate summary.";
  } finally {
    oModel.setProperty("/loading", false);
  }
},



    _scrollToBottom: function () {
      setTimeout(() => {
        const oScrollContainer = this.getView().byId("messageList").getParent();
        if (oScrollContainer && oScrollContainer.scrollTo) {
          oScrollContainer.scrollTo(0, oScrollContainer.getDomRef().scrollHeight, 500);
        }
      }, 100);
    }
  });
});