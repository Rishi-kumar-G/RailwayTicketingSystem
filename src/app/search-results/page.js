'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const source = searchParams.get('source');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');
  const classType = searchParams.get('class');
  const passengers = searchParams.get('passengers');

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await fetch(
          `/api/search-trains?source=${source}&destination=${destination}&date=${date}${classType ? `&class=${classType}` : ''}`
        );
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch trains');
        }
        
        setTrains(data.trains);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };  

    if (source && destination && date) {
      fetchTrains();
    }
  }, [source, destination, date, classType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for trains...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
            <Link href="/home" className="mt-4 inline-block text-blue-500 hover:underline">
              Try another search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-4xl mx-auto">
    {/* Header with brand */}
    <div className="flex items-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 12h16" />
        <path d="M12 4v16" />
      </svg>
      <h1 className="text-3xl font-bold text-blue-800">TrainFinder</h1>
    </div>
    
    {/* Search summary card */}
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Journey Details</h2>
      
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="flex flex-col items-center mr-3">
            <div className="w-3 h-3 rounded-full bg-green-500 mb-1"></div>
            <div className="w-0.5 h-16 bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
          </div>
          
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">From</p>
              <p className="text-lg font-semibold text-blue-800">{source}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To</p>
              <p className="text-lg font-semibold text-blue-800">{destination}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium text-black">{new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}</p>
            </div>
            {classType && (
              <div>
                <p className="text-gray-500">Class</p>
                <p className="font-medium capitalize">{classType}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modify search button */}
      <div className="mt-4 text-center">
        <button onClick={() => window.history.back()} className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Modify search
        </button>
      </div>
    </div>

    {/* No trains message */}
    {trains.length === 0 ? (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Trains Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find any trains matching your search criteria.</p>
        <Link href="/home" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          Try Another Search
        </Link>
      </div>
    ) : (
      <>
        {/* Results count and sorting */}
        <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center mb-6">
          <p className="text-gray-700 font-medium">{trains.length} trains found</p>
          <select className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option>Sort by: Departure</option>
            <option>Sort by: Duration</option>
            <option>Sort by: Price</option>
          </select>
        </div>
        
        {/* Train cards */}
        <div className="space-y-6">
          {trains.map((train) => (
            <div key={train.trainNumber} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Train header with name/number */}
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{train.trainName}</h2>
                    <p className="text-white text-opacity-80 text-sm">{train.trainNumber} • {train.trainType}</p>
                  </div>
                  <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                    {train.totalStops === 0 ? 'Direct' : `${train.totalStops} stops`}
                  </div>
                </div>
              </div>
              
              {/* Train details */}
              <div className="p-6">
                {/* Journey timing info */}
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-800">{train.departureTime}</p>
                    <p className="text-sm text-gray-500">{source}</p>
                  </div>
                  
                  <div className="flex-1 px-6 flex flex-col items-center">
                    <p className="text-sm text-gray-500 mb-1">{train.duration}</p>
                    <div className="w-full flex items-center">
                      <div className="h-0.5 flex-1 bg-gray-300"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mx-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <div className="h-0.5 flex-1 bg-gray-300"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{train.distance} km</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-800">{train.arrivalTime}</p>
                    <p className="text-sm text-gray-500">{destination}</p>
                  </div>
                </div>

                {/* Available classes section */}
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-black">Available Classes</h3>
                <div className="grid gap-4">
                  {train.classes.map((trainClass) => (
                    <div key={trainClass.classType} className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-center">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{
                              backgroundColor: trainClass.availableSeats > 20 ? '#10B981' : 
                                              trainClass.availableSeats > 0 ? '#F59E0B' : '#EF4444'
                            }}></span>
                            <p className="font-medium text-lg capitalize text-black">{trainClass.classType}</p>
                          </div>
                          <p className="text-3xl font-bold text-blue-600 mt-1">₹{trainClass.fare}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 text-sm p-3 bg-gray-50 rounded-lg mb-4 md:mb-0 md:mr-4">
                          <div>
                            <p className="text-gray-500">Available</p>
                            <p className="font-medium text-green-600">{trainClass.availableSeats}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">RAC</p>
                            <p className="font-medium text-yellow-600">{trainClass.racSeats}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Waitlist</p>
                            <p className="font-medium text-red-600">{trainClass.waitlistCount}</p>
                          </div>
                        </div>
                        
                        <Link
                          href={`/book-ticket?train=${train.trainNumber}&date=${date}&class=${trainClass.classType}&passengers=${passengers}`}
                          className="flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                          </svg>
                          Book Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* More options */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/search-results?source=${destination}&destination=${source}&date=${date}${classType ? `&class=${classType}` : ''}`} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Try Reverse Journey
            </Link>
            <Link href="/home" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              New Search
            </Link>
          </div>
        </div>
      </>
    )}
  </div>
</div>
  );
} 