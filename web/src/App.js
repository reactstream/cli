import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Analysis from './components/Analysis';
import Console from './components/Console';

const DEFAULT_CODE = `import React, { useState, useEffect } from 'react';

function ExampleComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <h1>Counter Example</h1>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default ExampleComponent;`;

const App = () => {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [analysisOutput, setAnalysisOutput] = useState('');
    const [consoleOutput, setConsoleOutput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isServing, setIsServing] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io();

        // Handle analysis results
        socketRef.current.on('analysis-result', (data) => {
            setAnalysisOutput(data.output || '');
            if (data.error) {
                setConsoleOutput(prev => `${prev}\n[ERROR] ${data.error}`);
            }
            setIsAnalyzing(false);
        });

        // Handle serve output
        socketRef.current.on('serve-output', (data) => {
            setConsoleOutput(prev => `${prev}\n${data.data}`);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setAnalysisOutput('Analyzing...');
        socketRef.current.emit('analyze-code', code);
    };

    const handlePreview = () => {
        setIsServing(true);
        setConsoleOutput('Starting development server...');
        socketRef.current.emit('preview-component', code);
    };

    const handleClearConsole = () => {
        setConsoleOutput('');
    };

    return (
        <div className="app-container">
            <header className="header">
                <div className="logo">ReactStream</div>
                <div className="controls">
                    <button className="button" onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                    <button className="button" onClick={handlePreview}>
                        {isServing ? 'Refresh' : 'Run'}
                    </button>
                    <button className="button" onClick={handleClearConsole}>
                        Clear Console
                    </button>
                </div>
            </header>
            <div className="panels-container">
                <div className="panel">
                    <div className="panel-header">Editor</div>
                    <div className="panel-content">
                        <Editor code={code} onChange={handleCodeChange} />
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-header">Preview</div>
                    <div className="panel-content">
                        <Preview isServing={isServing} />
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-header">Analysis</div>
                    <div className="panel-content">
                        <Analysis output={analysisOutput} isAnalyzing={isAnalyzing} />
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-header">Console</div>
                    <div className="panel-content">
                        <Console output={consoleOutput} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
