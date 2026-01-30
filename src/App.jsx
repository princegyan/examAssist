import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Navigation from './components/Navigation'
import ExamList from './pages/ExamList'
import UploadQuestion from './pages/UploadQuestion'
import CompareImage from './pages/CompareImage'
import ViewQuestions from './pages/ViewQuestions'
import ApiTest from './pages/ApiTest'

function App() {
  const [currentPage, setCurrentPage] = useState('exams')
  const [selectedExam, setSelectedExam] = useState(null)

  const handleNavigation = (page, exam = null) => {
    setCurrentPage(page)
    if (exam) setSelectedExam(exam)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation currentPage={currentPage} onNavigate={handleNavigation} />
      
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'exams' && (
          <ExamList onSelectExam={(exam) => handleNavigation('upload', exam)} />
        )}
        {currentPage === 'upload' && selectedExam && (
          <UploadQuestion examCode={selectedExam} onNavigate={handleNavigation} />
        )}
        {currentPage === 'compare' && (
          <CompareImage />
        )}
        {currentPage === 'view' && selectedExam && (
          <ViewQuestions examCode={selectedExam} />
        )}
        {currentPage === 'test' && (
          <ApiTest />
        )}
      </main>
    </div>
  )
}

export default App
