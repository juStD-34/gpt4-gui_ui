import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import CodeMirror, { useCodeMirror } from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";


const SeleniumCodeEditor = () => {
  const [javaCode, setJavaCode] = useState("// Your Java code goes here...");
  const editor = useRef(null); // Reference for the CodeMirror editor

  const extensions = [java()];
  const { setContainer } = useCodeMirror({
    container: editor.current,
    extensions,
    value: javaCode,
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [editor.current]);

  useEffect(() => {

    // Fetch the content for the editor
    const fetchJavaCode = async () => {
      try {
        // TODO: Modify the API endpoint
        const response = await fetch("/get-selenium-code");
        const data = await response.json();
        if (data.selenium_java) {
          editor.current.editor.setValue(data.selenium_java);
        }
      } catch (error) {
        console.error("Error fetching code:", error);
        alert("Failed to fetch code");
      }
    };

    // fetchJavaCode();

    const handleSave = async () => {
      try {
        // TODO: Modify the API endpoint and payload
        const response = await fetch("/save-selenium-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selenium_java: javaCode }),
        });
        if (response.ok) {
          alert("Code saved successfully");
        } else {
          alert("Error saving code");
        }
      } catch (error) {
        console.error("Error saving code:", error);
        alert("Error saving code");
      }
    };

    const saveButton = document.getElementById("saveButton");
    if (saveButton) {
      saveButton.addEventListener("click", handleSave);
    }

    return () => {
      if (saveButton) {
        saveButton.removeEventListener("click", handleSave);
      }
    };
  }, []);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="col-12 text-center mt-2">
          <Button id="saveButton" className="btn btn-primary mt-2">
            Save
          </Button>
        </div>
      </div>
      <div ref={editor} className="mt-5"/>
    </div>
  );
};

export default SeleniumCodeEditor;
