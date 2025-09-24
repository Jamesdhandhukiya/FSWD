// Calculator.js
import React, { useState } from 'react';
import './calc.css';

const Calculator = () => {
    const [input, setInput] = useState('');

    const handleClick = (value) => {
        setInput((prev) => prev + value);
    };

    const handleDelete = () => {
        setInput((prev) => prev.slice(0, -1));
    };

    const calculateResult = () => {
        try {
            const result = eval(input);
            setInput(result.toString());
        } catch {
            setInput('Error');
        }
    };

    return (
        <div className="calculator">
            <div className="display">{input || "0"}</div>
            <div className="buttons">
                <button onClick={() => handleClick('/')}>/</button>
                <button onClick={() => handleClick('*')}>*</button>
                <button onClick={() => handleClick('+')}>+</button>
                <button onClick={() => handleClick('-')}>-</button>
                <button onClick={handleDelete}>DEL</button>
                  </div>
             <div className='buttons1'>
                   {[1,2,3,4,5,6,7,8,9,0].map(num => (
                    <button key={num} onClick={() => handleClick(num.toString())}>{num}</button>
                ))}
                  <button onClick={() => handleClick('.')}>.</button>
                <button onClick={calculateResult}>=</button>
             </div>
             

              
          
        </div>
    );
};

export default Calculator;