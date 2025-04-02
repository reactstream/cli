import React, { useRef, useEffect } from 'react';

const Preview = ({ isServing }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
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
                    src="http://localhost:3000"
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
