import React from 'react';
import MonacoEditor from 'react-monaco-editor';

const Editor = ({ code, onChange }) => {
    const editorOptions = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        minimap: {
            enabled: false
        }
    };

    return (
        <div className="editor-container">
            <MonacoEditor
                width="100%"
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={code}
                options={editorOptions}
                onChange={onChange}
            />
        </div>
    );
};

export default Editor;
