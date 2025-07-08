I built a Gemini-powered chatbot using SAP Fiori with UI5, integrating directly with the Gemini 2.5 Pro API — entirely frontend-only, without any backend services. All chat interactions are managed locally through a JSON model maintained within the view's controller, which resets upon page reload (no persistent storage).

The chatbot accepts text prompts as well as file uploads (e.g., PDFs), which are encoded and sent to the Gemini API for summarization or contextual discussion. Since no backend is involved, this is not an implementation of a Retrieval-Augmented Generation (RAG) model — the chatbot operates on individual prompts or file inputs without document memory or context retrieval.

This project showcases how Gemini's powerful LLM capabilities can be embedded in a pure SAP UI5 frontend for lightweight prototyping and integration.

Future improvements could include implementing context caching and full RAG architecture using a backend, enabling persistent conversation history and more advanced context-aware responses.
