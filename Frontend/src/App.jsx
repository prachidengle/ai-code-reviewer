
import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css";

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);

  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    if (isLoading) return;

    if (!code.trim()) {
      setReview("Please enter some code to review.");
      return;
    }

    setIsLoading(true);
    setReview("Reviewing your code...");

    try {
      const response = await axios.post(
        "http://localhost:3000/ai/get-review",
        { code }
      );

      setReview(
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data, null, 2)
      );
    } catch (error) {
      const status = error.response?.status;
      const serverMessage = error.response?.data;

      if (status === 429) {
        setReview(
          typeof serverMessage === "string"
            ? serverMessage
            : "Gemini rate limit reached. Wait about 60 seconds before trying again."
        );
      } else if (status === 503) {
        setReview(
          typeof serverMessage === "string"
            ? serverMessage
            : "Gemini is temporarily unavailable. Please try again shortly."
        );
      } else if (typeof serverMessage === "string") {
        setReview(serverMessage);
      } else if (!error.response) {
        setReview(
          "Cannot connect to the backend. Make sure the server is running on http://localhost:3000."
        );
      } else {
        setReview(
          `Review failed with status ${status || "unknown"}. Check the backend terminal for details.`
        );
      }

      console.error("Code review request failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={(newCode) => setCode(newCode)}
            highlight={(code) =>
              prism.highlight(
                code,
                prism.languages.javascript,
                "javascript"
              )
            }
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              border: "1px solid #ddd",
              borderRadius: "5px",
              height: "100%",
              width: "100%"
            }}
          />
        </div>

        <button
          type="button"
          onClick={reviewCode}
          className="review"
          disabled={isLoading}
        >
          {isLoading ? "Reviewing..." : "Review"}
        </button>
      </div>

      <div className="right">
        <Markdown rehypePlugins={[rehypeHighlight]}>
          {review}
        </Markdown>
      </div>
    </main>
  );
}

export default App;
