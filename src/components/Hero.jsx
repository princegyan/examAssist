import { useState } from 'react'
export default function Hero() {
  return (
    <div className="bg-salient-gradient text-white py-20 px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Inlaks T24</h1>
      <p className="text-lg">Streamline your exams dump management with cutting-edge tools.</p>
      <div className="mt-6">
        <button className="px-6 py-3 bg-white text-salient-blue font-semibold rounded shadow hover:bg-gray-100">
          Get Started
        </button>
      </div>
    </div>
  );
}
