import { Link } from 'react-router-dom';
import { useState } from 'react';

const Home = () => {
  return (
    <div className="bg-white">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight">
              <span className="block">Find Reliable Workers</span>
              <span className="block text-blue-600">In Your Neighborhood</span>
            </h1>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition"
              >
                Browse Services
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-blue-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md transition"
              >
                Join as a Worker
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Get your tasks done in three simple steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            
            {/* Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200"></div>

            {/* Step 1 */}
            <div className="relative p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-xl transition group">
              
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow">
                1
              </div>

              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 text-lg font-bold group-hover:scale-110 transition">
                1
              </div>

              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-gray-500">
                Find the right professional based on reviews, skills, and proximity.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-xl transition group">
              
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-sm px-3 py-1 rounded-full shadow">
                2
              </div>

              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 text-lg font-bold group-hover:scale-110 transition">
                2
              </div>

              <h3 className="text-xl font-semibold mb-2">Book</h3>
              <p className="text-gray-500">
                Schedule an appointment that fits your busy life instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-xl transition group">
              
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-sm px-3 py-1 rounded-full shadow">
                3
              </div>

              <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-5 text-lg font-bold group-hover:scale-110 transition">
                3
              </div>

              <h3 className="text-xl font-semibold mb-2">Relax</h3>
              <p className="text-gray-500">
                Let the expert handle the job while you enjoy peace of mind.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
            Popular Categories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Electrician', icon: '⚡' },
              { name: 'Plumber', icon: '🚿' },
              { name: 'Carpenter', icon: '🔨' },
              { name: 'Cleaning', icon: '🧹' },
              { name: 'Painting', icon: '🎨' },
              { name: 'AC Repair', icon: '❄️' },
              { name: 'Pest Control', icon: '🐛' },
              { name: 'Moving', icon: '🚚' }
            ].map(({ name, icon }, idx) => (
              <Link
                key={idx}
                to="/services"
                className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <span className="font-medium text-lg">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;