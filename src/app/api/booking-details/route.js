import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pnr = searchParams.get('pnr');

    if (!pnr) {
      return NextResponse.json(
        { error: 'PNR number is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Get ticket details
      const [ticket] = await connection.query(
        `SELECT t.*, tr.train_name, rs1.departure_time, rs2.arrival_time
         FROM TICKET t
         JOIN TRAIN tr ON t.train_number = tr.train_number
         JOIN ROUTE r ON t.train_number = r.train_number
         JOIN ROUTE_STATION rs1 ON r.route_id = rs1.route_id AND t.source_station = rs1.station_code
         JOIN ROUTE_STATION rs2 ON r.route_id = rs2.route_id AND t.destination_station = rs2.station_code
         WHERE t.pnr_number = ?`,
        [pnr]
      );

      if (!ticket.length) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Get passenger details
      const [passengers] = await connection.query(
        `SELECT p.*, pt.seat_number, pt.coach_number, pt.reservation_status as status
         FROM PASSENGER p
         JOIN PASSENGER_TICKET pt ON p.passenger_id = pt.passenger_id
         WHERE pt.pnr_number = ?`,
        [pnr]
      );

      // Get payment details
      const [payment] = await connection.query(
        `SELECT * FROM PAYMENT WHERE pnr_number = ?`,
        [pnr]
      );

      const bookingDetails = {
        pnr: ticket[0].pnr_number,
        trainName: ticket[0].train_name,
        trainNumber: ticket[0].train_number,
        classType: ticket[0].class_type,
        journeyDate: ticket[0].journey_date,
        sourceStation: ticket[0].source_station,
        destinationStation: ticket[0].destination_station,
        departureTime: ticket[0].departure_time,
        arrivalTime: ticket[0].arrival_time,
        totalFare: ticket[0].total_fare,
        passengers: passengers.map(passenger => ({
          name: passenger.name,
          age: calculateAge(passenger.date_of_birth),
          gender: passenger.gender,
          seatNumber: passenger.seat_number,
          coachNumber: passenger.coach_number,
          status: passenger.status
        })),
        paymentMode: payment[0].payment_mode,
        transactionId: payment[0].transaction_id,
        paymentStatus: payment[0].payment_status
      };

      return NextResponse.json(bookingDetails);

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}

function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
} 