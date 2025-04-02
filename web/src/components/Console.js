import React, { useEffect, useRef } from 'react';

const Console = ({ output }) => {
    const consoleRef = useRef(null);

    useEffect(() => {
        // Auto-scroll to bottom when new content is added
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [output]);

    // Format console output with colors
    const formatOutput = (text) => {
        if (!text) return null;

        return text.split('\n').map((line, index) => {
            if (line.includes('ERROR') || line.includes('error')) {
                return <div key={index} className="error">{line}</div>;
            } else if (line.includes('WARNING') || line.includes('warning')) {
                return <div key={index} className="warning">{line}</div>;
            } else if (line.includes('Server running') || line.includes('success')) {
                return <div key={index} className="success">{line}</div>;
            }
            return <div key={index}>{line}</div>;
        });
    };

    return (
        <div className="console-container" ref={consoleRef}>
            {formatOutput(output) || 'Console output will appear here...'}
        </div>
    );
};

export default Console;
