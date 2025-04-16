'use client';

import { useState } from 'react';
import { Search, Ticket, Train, Calendar, User, CreditCard } from 'lucide-react';

export default function RevenueReport() {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/revenue-report?pnr=${pnr}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ticket details');
      }

      setTicketDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ticket Details</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter PNR number to view ticket details
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">PNR Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Ticket className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter PNR number"
                  required
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
            {error}
          </div>
        )}

        {/* Ticket Details */}
        {ticketDetails && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Train Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Train className="h-5 w-5 mr-2 text-blue-500" />
                    Train Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Train Number:</span> {ticketDetails.trainNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Train Name:</span> {ticketDetails.trainName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Class:</span> {ticketDetails.classType}
                    </p>
                  </div>
                </div>

                {/* Journey Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Journey Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {new Date(ticketDetails.journeyDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">From:</span> {ticketDetails.sourceStation}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">To:</span> {ticketDetails.destinationStation}
                    </p>
                  </div>
                </div>

                {/* Passenger Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    Passenger Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Name:</span> {ticketDetails.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Age:</span> {ticketDetails.age}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Gender:</span> {ticketDetails.gender}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Seat:</span> {ticketDetails.seatNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Coach:</span> {ticketDetails.coachNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> {ticketDetails.reservationStatus}
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                    Payment Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Basic Fare:</span> ₹{ticketDetails.basicFare}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">GST:</span> ₹{ticketDetails.gstAmount}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Service Charge:</span> ₹{ticketDetails.serviceCharge}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Concession:</span> ₹{ticketDetails.concessionAmount}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Total Fare:</span> ₹{ticketDetails.totalFare}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Payment Mode:</span> {ticketDetails.paymentMode}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Transaction ID:</span> {ticketDetails.transactionId}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Payment Status:</span> {ticketDetails.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
