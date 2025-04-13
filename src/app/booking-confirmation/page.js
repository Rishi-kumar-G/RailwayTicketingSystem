'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookingConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pnr = searchParams.get('pnr');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pnr) {
      router.push('/home');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/booking-details?pnr=${pnr}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch booking details');
        }

        setBookingDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [pnr, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking details...</p>
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
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success message */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-center text-gray-600">Your ticket has been successfully booked.</p>
        </div>

        {/* PNR and Journey Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">PNR Number</p>
                  <p className="text-xl font-bold text-blue-600">{bookingDetails.pnr}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Train</p>
                  <p className="font-medium">{bookingDetails.trainName} ({bookingDetails.trainNumber})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium">{bookingDetails.classType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Journey Date</p>
                  <p className="font-medium">{new Date(bookingDetails.journeyDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Route Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">{bookingDetails.sourceStation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium">{bookingDetails.destinationStation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Departure</p>
                  <p className="font-medium">{bookingDetails.departureTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Arrival</p>
                  <p className="font-medium">{bookingDetails.arrivalTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Passenger Details</h2>
          <div className="space-y-4">
            {bookingDetails.passengers.map((passenger, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{passenger.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age/Gender</p>
                    <p className="font-medium">{passenger.age} / {passenger.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Seat/Coach</p>
                    <p className="font-medium">{passenger.seatNumber} / {passenger.coachNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-green-600">{passenger.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Total Fare</p>
                  <p className="text-xl font-bold text-blue-600">₹{bookingDetails.totalFare}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Mode</p>
                  <p className="font-medium">{bookingDetails.paymentMode}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{bookingDetails.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="font-medium text-green-600">{bookingDetails.paymentStatus}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/home"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Book Another Ticket
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
} 