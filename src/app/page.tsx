import ChatInterface from '@/components/ChatInterface'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Physics Research Agent
          </h1>
          <p className="text-lg text-gray-600">
            Ask physics questions and get detailed explanations with equations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Chat Interface */}
          <div className="h-[600px]">
            <ChatInterface />
          </div>

          {/* Dashboard */}
          <div className="h-[600px] overflow-y-auto">
            <Dashboard />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">GPT-4 powered physics explanations</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Real-time</h3>
            <p className="text-sm text-gray-600">Instant responses to your questions</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🔬</div>
            <h3 className="font-semibold mb-2">Research-Grade</h3>
            <p className="text-sm text-gray-600">Detailed step-by-step solutions</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Structured Analysis</h3>
            <p className="text-sm text-gray-600">Equations, concepts, and explanations</p>
          </div>
        </div>
      </div>
    </main>
  )
} 