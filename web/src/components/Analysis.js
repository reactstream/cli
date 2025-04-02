import React from 'react';

const Analysis = ({ output, isAnalyzing }) => {
    if (isAnalyzing) {
        return (
            <div className="analysis-container">
                <div className="loading">Analyzing component...</div>
            </div>
        );
    }

    // Format the analysis output with colors
    const formatOutput = (text) => {
        if (!text) return null;

        return text.split('\n').map((line, index) => {
            if (line.includes('error')) {
                return <div key={index} className="error">{line}</div>;
            } else if (line.includes('warning')) {
                return <div key={index} className="warning">{line}</div>;
            } else if (line.includes('success') || line.includes('passed')) {
                return <div key={index} className="success">{line}</div>;
            } else if (line.includes('info')) {
                return <div key={index} className="info">{line}</div>;
            }
            return <div key={index}>{line}</div>;
        });
    };

    return (
        <div className="analysis-container">
            {formatOutput(output) || 'No analysis results yet. Click "Analyze" to check your component.'}
        </div>
    );
};

export default Analysis;
