import React, { useRef, useEffect, useState } from 'react';

const Preview = ({ isServing }) => {
    const iframeRef = useRef(null);
    const [devServerPort, setDevServerPort] = useState(3000);

    useEffect(() => {
        // Get the development server port from the environment
        // This is passed to the client via a fetch request
        fetch('/api/config')
            .then(response => response.json())
            .then(config => {
                if (config.devServerPort) {
                    setDevServerPort(config.devServerPort);
                }
            })
            .catch(error => {
                console.error('Failed to fetch config:', error);
            });

        // When component is unmounted, clear the iframe
        return () => {
            if (iframeRef.current) {
                iframeRef.current.src = 'about:blank';
            }
        };
    }, []);

    return (
        <div className="preview-container">
            {!isServing ? (
                <div className="preview-placeholder">
                    <p>Click "Run" to preview the component</p>
                </div>
            ) : (
                <iframe
                    ref={iframeRef}
                    src={`http://localhost:${devServerPort}`}
                    title="Component Preview"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                />
            )}
        </div>
    );
};

export default Preview;
