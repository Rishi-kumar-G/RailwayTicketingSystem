'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Payment() {
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const details = localStorage.getItem('bookingDetails');
    if (!details) {
      router.push('/home');
      return;
    }
    setBookingDetails(JSON.parse(details));
  }, [router]);

  const handlePayment = async (paymentMode) => {
    setLoading(true);
    try {
      const response = await fetch('/api/book-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingDetails,
          paymentMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Clear booking details from localStorage
      localStorage.removeItem('bookingDetails');
      
      // Redirect to booking confirmation page
      router.push(`/booking-confirmation?pnr=${data.pnr}`);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Booking Summary</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Train</p>
                <p className="font-medium">{bookingDetails.trainNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium">{bookingDetails.classType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(bookingDetails.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passenger</p>
                <p className="font-medium">{bookingDetails.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handlePayment('Online')}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Online'}
          </button>

          <button
            onClick={() => handlePayment('Offline')}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay at Station'}
          </button>
        </div>
      </div>
    </div>
  );
} 