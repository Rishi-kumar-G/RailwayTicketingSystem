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
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancellationDetails, setShowCancellationDetails] = useState(false);
  const [cancellationDetails, setCancellationDetails] = useState(null);

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

  const handleCancelTicket = async () => {
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch('/api/cancel-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pnr: bookingDetails.pnr,
          reason: cancellationReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel ticket');
      }

      // Store cancellation details and show the modal
      setCancellationDetails(data);
      setShowCancelModal(false);
      setShowCancellationDetails(true);
      
      // Refresh the booking details
      const bookingResponse = await fetch(`/api/booking-details?pnr=${bookingDetails.pnr}`);
      const bookingData = await bookingResponse.json();
      setBookingDetails(bookingData);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

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
        {/* Status message */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            {bookingDetails.bookingStatus === 'CANCELLED' ? (
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">

                {bookingDetails.passengers.some(passenger => passenger.status === 'CONFIRMED') ? (
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : bookingDetails.bookingStatus === 'WAITING' ? (
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}


                
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {bookingDetails.passengers.some(passenger => passenger.status === 'CANCELLED') ? 'Ticket Cancelled' : 'Booking Confirmed!'}
          </h1>
          <p className="text-center text-gray-600">
            {bookingDetails.passengers.some(passenger => passenger.status === 'CANCELLED')   
              ? 'Your ticket has been cancelled.' 
              : 'Your ticket has been successfully booked.'}
          </p>
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
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${
                    bookingDetails.bookingStatus === 'CANCELLED' 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {bookingDetails.bookingStatus}
                  </p>
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
                    <p className="font-medium">
                      {passenger.seatNumber ? `${passenger.seatNumber} / ${passenger.coachNumber}` : 'Not Allocated'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${
                      passenger.status === 'CANCELLED' 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {passenger.status}
                    </p>
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
                  <p className="font-medium">{bookingDetails.payment.paymentMode}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{bookingDetails.payment.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className={`font-medium ${
                    bookingDetails.payment.paymentStatus === 'Refunded' 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`}>
                    {bookingDetails.payment.paymentStatus}
                  </p>
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
          {bookingDetails.bookingStatus !== 'CANCELLED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Ticket
            </button>
          )}
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Cancel Ticket</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this ticket? Please provide a reason for cancellation.
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full p-2 border rounded-lg mb-4"
                rows="3"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelTicket}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Details Modal */}
        {showCancellationDetails && cancellationDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Cancellation Details</h2>
                <button
                  onClick={() => setShowCancellationDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">PNR Number:</span>
                  <span className="font-medium">{cancellationDetails.pnr}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancellation Charge:</span>
                  <span className="font-medium text-red-600">₹{cancellationDetails.cancellationCharge.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Refund Amount:</span>
                  <span className="font-medium text-green-600">₹{cancellationDetails.refundAmount.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-green-600 font-medium">{cancellationDetails.message}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCancellationDetails(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 