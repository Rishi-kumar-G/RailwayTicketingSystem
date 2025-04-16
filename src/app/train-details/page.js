// src/app/train-details/page.js
'use client';

import { useState, useEffect } from 'react';
import { Search, Train, Clock, MapPin, Users, Calendar } from 'lucide-react';

export default function TrainDetailsPage() {
  const [trainNumber, setTrainNumber] = useState('');
  const [trainDetails, setTrainDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trainNumber) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/train-details?trainNumber=${trainNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch train details');
      }

      setTrainDetails(data);
    } catch (err) {
      setError(err.message);
      setTrainDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-600 py-4 px-8">
            <h2 className="text-xl font-bold text-white">Train Details Search</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  placeholder="Enter train number"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
            {error}
          </div>
        )}

        {/* Train Details */}
        {trainDetails && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 py-4 px-8">
              <h2 className="text-xl font-bold text-white">{trainDetails.trainName}</h2>
              <p className="text-blue-100">Train Number: {trainDetails.trainNumber}</p>
            </div>
            
            <div className="p-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-2">
                  <Train className="h-5 w-5 text-blue-500" />
                  <span>Type: {trainDetails.trainType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Total Coaches: {trainDetails.totalCoaches}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>Route: {trainDetails.route.source} to {trainDetails.route.destination}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Distance: {trainDetails.route.totalDistance} km</span>
                </div>
              </div>

              {/* Running Days */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Running Days</h3>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(trainDetails.runningDays).map(([day, runs]) => (
                    <div
                      key={day}
                      className={`p-2 rounded text-center ${
                        runs ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trainDetails.schedule.map((stop, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{stop.stationName}</div>
                            <div className="text-sm text-gray-500">{stop.city}, {stop.state}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stop.arrivalTime || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stop.departureTime || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stop.distanceFromSource} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stop.platformNumber || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Available Classes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Classes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainDetails.classes.map((cls, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium">{cls.classType}</div>
                      <div className="text-sm text-gray-500">Seats: {cls.totalSeats}</div>
                      <div className="text-sm text-gray-500">Fare: ₹{cls.basicFare}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}