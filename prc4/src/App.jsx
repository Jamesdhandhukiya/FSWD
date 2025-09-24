import { useState ,useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(255, 255, 255,0.2)" }) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');

  function handleIncrement() {
    setCount(count + 1);}

  function handleDecrement() {  
    setCount(count - 1);}
  function handleReset() {
    setCount(0);}
  function handleIncrementByFive() {
    setCount(count + 5);}
    function handleNameChange(event) {
      setName(event.target.value);
    }
    function handleLastNameChange(event) {
      setLastName(event.target.value);  }

  return (
    <>
    


<SpotlightCard className='h-150 w-200 bg-gray text-white mx-auto mt-25' spotlightColor='rgba(255, 255, 255,0.2)'>
  
    <div className='flex flex-col gap-5  items-center justify-center '>
      <h1 className="text-4xl font-bold text-black-600 mb-4 mt-10">Count : {count}</h1>
      
<div>
  <button onClick={handleIncrement} type="button" class="text-white bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Increament</button>
  <button onClick={handleDecrement} type="button" class="text-white bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Decreament</button>
  <button onClick={handleReset} type="button" class="text-white bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Reset</button>
  <button onClick={handleIncrementByFive} type="button" class="text-white bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Increament 5</button>
</div>
<h1 className='text-4xl font-bold text-black-600 mb-4 mt-10'>Welcome to Charusat !</h1>
<div>
   First name : <input  onInput={handleNameChange} type="text" className='border-2 border-gray-300 rounded-lg p-2' placeholder='Enter your first name' />
</div>
<div>
   Last name : <input onInput={handleLastNameChange} type="text" className='border-2 border-gray-300 rounded-lg p-2' placeholder='Enter your last name' />
</div>
<div >First Name : {name} </div>
<div >Last Name : {lastName}</div>

    </div>
</SpotlightCard>
    </>
  )
}

export default App
