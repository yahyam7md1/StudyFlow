import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Trash2, Plus, List } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  checked: boolean;
  createdAt: Date;
}

const TodoList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showTodo, setShowTodo] = useState(false);

  const addTask = () => {
    if (inputValue.trim()) {
      setTasks([...tasks, {
        id: Math.random().toString(),
        text: inputValue,
        checked: false,
        createdAt: new Date()
      }]);
      setInputValue('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, checked: !task.checked } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setShowTodo(true)}
        className="fixed bottom-2.5 right-14 z-50 p-1.5 bg-white/20 backdrop-blur-sm rounded-full
                 shadow-lg hover:bg-white/30 transition-all border-2 border-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <List className="text-white w-6 h-6" />
      </motion.button>

      {/* Main Todo Overlay */}
      <AnimatePresence>
        {showTodo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            {/* Todo Container */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-[60vw] min-h-[50vh] bg-gradient-to-br from-gray-900 to-gray-800
                        rounded-xl shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    To Do List
                  
                  </h2>
                  <motion.button
                    onClick={() => setShowTodo(false)}
                    className="text-white/50 hover:text-white text-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>

                {/* Input Area */}
                <div className="flex gap-4">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Enter new task..."
                    className="flex-1 bg-white/5 rounded-lg px-4 py-3 text-white 
                             placeholder-white/30 border border-white/10 focus:border-blue-400
                             outline-none transition-all"
                  />
                  <motion.button
                    onClick={addTask}
                    className="p-3 bg-blue-400/20 rounded-lg hover:bg-blue-400/30 transition-colors
                              border border-blue-400/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="text-blue-400" size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Task List */}
              <div className="p-6 h-[40vh] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="group flex items-center gap-3 mb-2 p-3 bg-white/5 rounded-lg
                                border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <motion.button
                        onClick={() => toggleTask(task.id)}
                        className={`h-5 w-5 flex items-center justify-center rounded-md
                                  ${task.checked ? 'bg-blue-400' : 'bg-white/10'}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {task.checked && <Check className="text-white w-3 h-3" />}
                      </motion.button>

                      <span className={`flex-1 ${task.checked ? 'text-white/50 line-through' : 'text-white'}`}>
                        {task.text}
                      </span>

                      <motion.button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400/50 hover:text-red-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {tasks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-white/50"
                  >
                    <div className="text-4xl mb-4">📭</div>
                    <p>No tasks yet. Add your first task!</p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              {tasks.length > 0 && (
                <div className="p-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm text-white/70">
                    {tasks.filter(t => !t.checked).length} remaining
                  </span>
                  <motion.button
                    onClick={clearAllTasks}
                    className="px-3 py-1 text-sm bg-red-400/10 text-red-400/80 hover:text-red-400
                              rounded-md border border-red-400/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TodoList;