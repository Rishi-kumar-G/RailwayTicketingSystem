'use client';

import { useState } from 'react';
import { Search, Calendar, MapPin, Train, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: '',
    passengers: 1,
    class: 'economy',
  });

  const [isSearching, setIsSearching] = useState(false);
  
  // Popular stations for quick selection
  const popularStations = [
    'London', 'Manchester', 'Birmingham', 'Edinburgh', 
    'Glasgow', 'Liverpool', 'Leeds', 'Sheffield'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Searching for trains:', formData);
      setIsSearching(false);
      // Here you would typically handle the search results
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const swapStations = () => {
    setFormData(prev => ({
      ...prev,
      source: prev.destination,
      destination: prev.source
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 py-6 px-8">
            <div className="flex items-center">
              <Train className="text-white h-8 w-8 mr-3" />
              <h1 className="text-3xl font-bold text-white">TrainFinder</h1>
            </div>
            <p className="text-blue-100 mt-2">Find and book the best train tickets for your journey</p>
          </div>
          
          {/* Main Form */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source & Destination with swap button */}
                <div className="relative">
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                    From
                  </label>
                  <input
                    type="text"
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-10 py-3"
                    placeholder="Enter source station"
                    list="sourceStations"
                    required
                  />
                  <datalist id="sourceStations">
                    {popularStations.map(station => (
                      <option key={station} value={station} />
                    ))}
                  </datalist>
                </div>
                
                <div className="relative">
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                    To
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-10 py-3"
                    placeholder="Enter destination station"
                    list="destStations"
                    required
                  />
                  <datalist id="destStations">
                    {popularStations.map(station => (
                      <option key={station} value={station} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Swap button positioned between source and destination */}
              <div className="flex justify-center -mt-3 mb-3">
                <button
                  type="button"
                  onClick={swapStations}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-blue-50 transition-colors"
                >
                  <ArrowRight className="h-5 w-5 text-blue-600 transform rotate-90" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date picker */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                    Journey Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Passengers */}
                <div>
                  <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
                    Passengers
                  </label>
                  <select
                    id="passengers"
                    name="passengers"
                    value={formData.passengers}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
                
                {/* Class */}
                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
                  >
                    <option value="economy">Economy</option>
                    <option value="standard">Standard</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg font-medium transition-colors"
              >
                {isSearching ? (
                  <>
                    <span className="animate-pulse mr-2">Searching</span>
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search Trains
                  </>
                )}
              </button>
            </form>
            
            {/* Quick tips section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Book in advance for the best fares</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Train className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Off-peak tickets are usually cheaper</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}