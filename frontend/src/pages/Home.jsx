import React, { useState } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import Chatbot from '../components/chatbot'

const Home = () => {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div>
      <Header />
      
      {/* Tab Navigation */}
      <div className="tab-navigation flex justify-center bg-white py-3 mb-4 border-b shadow-sm">
        <button 
          className={`px-6 py-2 mx-2 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-primary text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button 
          className={`px-6 py-2 mx-2 rounded-lg transition-colors ${activeTab === 'chatbot' ? 'bg-primary text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('chatbot')}
        >
          AI Health Assistant
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'home' && (
        <>
          <SpecialityMenu />
          <TopDoctors />
          <Banner />
        </>
      )}
      
      {activeTab === 'chatbot' && (
        <div className="container mx-auto px-4 py-6">
          <Chatbot />
        </div>
      )}
    </div>
  )
}

export default Home