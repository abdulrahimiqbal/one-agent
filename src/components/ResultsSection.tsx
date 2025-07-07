'use client'

import { FileText, BarChart3, Calculator, BookOpen, Download } from 'lucide-react'
import { ResearchSession, ResearchResult } from '@/types/research'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface ResultsSectionProps {
  session: ResearchSession | null
}

export default function ResultsSection({ session }: ResultsSectionProps) {
  const getResultIcon = (type: ResearchResult['type']) => {
    switch (type) {
      case 'equation':
        return <Calculator className="h-4 w-4 text-physics-green" />
      case 'graph':
        return <BarChart3 className="h-4 w-4 text-physics-purple" />
      case 'citation':
        return <BookOpen className="h-4 w-4 text-physics-blue" />
      case 'calculation':
        return <Calculator className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getResultColor = (type: ResearchResult['type']) => {
    switch (type) {
      case 'equation':
        return 'bg-green-50 border-green-200'
      case 'graph':
        return 'bg-purple-50 border-purple-200'
      case 'citation':
        return 'bg-blue-50 border-blue-200'
      case 'calculation':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const handleDownload = (result: ResearchResult) => {
    const blob = new Blob([result.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-physics-green" />
          Research Results
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Generated equations, calculations, and findings
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!session?.results.length ? (
          <div className="text-center text-gray-500 mt-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No results yet</p>
            <p className="text-sm mt-2">
              Results will appear here as the agent processes your physics questions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {session.results.map((result) => (
              <div
                key={result.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${getResultColor(result.type)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {result.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mt-1">
                        {result.title}
                      </h3>
                      <div className="mt-2 prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          className="text-gray-700"
                        >
                          {result.content}
                        </ReactMarkdown>
                      </div>
                      {result.metadata && (
                        <div className="mt-3 text-xs text-gray-500">
                          <div className="bg-white bg-opacity-50 rounded p-2">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(result)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Download result"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {session && session.results.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total Results: {session.results.length}
            </span>
            <button
              onClick={() => {
                const allResults = session.results.map(r => 
                  `# ${r.title}\n\n${r.content}\n\n---\n\n`
                ).join('')
                const blob = new Blob([allResults], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `physics_research_results_${Date.now()}.txt`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
              className="text-physics-blue hover:text-physics-purple transition-colors"
            >
              Download All
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 