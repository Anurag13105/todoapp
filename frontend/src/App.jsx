import  { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";

const columns = ["To Do", "In Progress", "Done"];

const App = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks));
  }, []);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const taskId = parseInt(result.draggableId);
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: destination.droppableId } : task
    );
    setTasks(updatedTasks);

    const movedTask = updatedTasks.find((t) => t.id === taskId);
    fetch(`http://localhost:8000/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movedTask),
    });
  };

  const handleAdd = () => {
    const newTask = {
      id: Date.now(),
      title: "New Task",
      description: "",
      status: "To Do",
    };
    setTasks([...tasks, newTask]);
    fetch("http://localhost:8000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    fetch(`http://localhost:8000/tasks/${id}`, {
      method: "DELETE",
    });
  };

  const handleTitleChange = (id, newTitle) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, title: newTitle } : task
    );
    setTasks(updatedTasks);
  };

  const handleCheckboxChange = (task) => {
    const updatedTask = {
      ...task,
      status: task.status === "Done" ? "To Do" : "Done",
    };
    const updatedTasks = tasks.map((t) => (t.id === task.id ? updatedTask : t));
    setTasks(updatedTasks);

    fetch(`http://localhost:8000/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
  };

  const handleBlur = (task) => {
    fetch(`http://localhost:8000/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
  };

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-gray-900 dark:to-gray-800 p-6">
    <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
      🗂️ Task Board
    </h1>

    <div className="flex justify-center mb-6">
      <button
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow"
        onClick={handleAdd}
      >
        + Add Task
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((col) => (
          <Droppable droppableId={col} key={col}>
            {(provided) => ( 
              <div
                className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow min-h-[300px] flex flex-col"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-100">
                  {col}
                </h2>

                {tasks
                  .filter((task) => task.status === col)
                  .map((task, index) => (
                    <Draggable
                      draggableId={task.id.toString()}
                      index={index}
                      key={task.id}
                    >
                      {(provided) => (
                        <div
                          className="bg-gray-100 dark:bg-gray-800 p-3 mb-3 rounded shadow hover:shadow-md transition"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              {...provided.dragHandleProps}
                              className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              title="Drag"
                            >
                              ⠿
                            </span>

                            <input
                              type="checkbox"
                              checked={task.status === "Done"}
                              onChange={() => handleCheckboxChange(task)}
                              className="accent-blue-600"
                            />

                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) =>
                                handleTitleChange(task.id, e.target.value)
                              }
                              onBlur={() => handleBlur(task)}
                              className="flex-1 text-sm bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white px-1"
                            />

                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(task.id)}
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  </div>
);

};

export default App;
