import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-8">ReflectAI</h1>
        <div className="text-center">
          <p className="text-xl mb-4">Your Daily Reflection Companion</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium"
            onClick={() => setCount((count) => count + 1)}
          >
            Test Button: {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App