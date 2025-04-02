import React, { useState } from 'react';

const MyComponent = () => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleIncrement = () => {
    setCount(prevCount => prevCount + 1);
  };

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return (
    <div className="my-component">
      <h2>My Example Component</h2>

      {isVisible && (
        <div className="counter-section">
          <p>Count: {count}</p>
          <button onClick={handleIncrement}>
            Increment
          </button>
        </div>
      )}

      <button onClick={toggleVisibility}>
        {isVisible ? 'Hide' : 'Show'} Counter
      </button>
    </div>
  );
};

export default MyComponent;
