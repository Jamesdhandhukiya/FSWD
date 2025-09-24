import React, { useState } from 'react';
import './ToDoApp.css';

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    if (input.trim() === '') return;
    setTasks([...tasks, input]);
    setInput('');
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const updateTask = (index) => {
    const updated = prompt('Edit task:', tasks[index]);
    if (updated !== null && updated.trim() !== '') {
      const newTasks = [...tasks];
      newTasks[index] = updated;
      setTasks(newTasks);
    }
  };

  return (
    <div className="container">
      <h1>Get Things Done !</h1>
      <div className="input-section">
        <input 
          type="text" 
          placeholder="What is the task today?" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <div className="tasks">
        {tasks.map((task, index) => (
          <div key={index} className="task">
            {task}
            <div className="actions">
              <button onClick={() => updateTask(index)}>Edit</button>
              <button onClick={() => deleteTask(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoApp;