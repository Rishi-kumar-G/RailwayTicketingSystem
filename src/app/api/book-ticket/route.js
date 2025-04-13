import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const bookingData = await request.json();
    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      idProofType,
      idProofNumber,
      isRegistered,
      trainNumber,
      date,
      classType,
      paymentMode
    } = bookingData;

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Insert passenger details
      const [passengerResult] = await connection.query(
        `INSERT INTO PASSENGER (
          name, email, phone, address, date_of_birth, gender, 
          id_proof_type, id_proof_number, is_registered
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, phone, address, dateOfBirth, gender, idProofType, idProofNumber, isRegistered]
      );

      const passengerId = passengerResult.insertId;

      // 2. Generate PNR
      const pnr = generatePNR();

      // 3. Get train class details for fare calculation
      const [trainClass] = await connection.query(
        `SELECT basic_fare FROM TRAIN_CLASS 
         WHERE train_number = ? AND class_type = ?`,
        [trainNumber, classType]
      );

      const basicFare = trainClass[0].basic_fare;
      const totalFare = basicFare; // In a real system, you'd calculate with taxes, etc.

      // 4. Insert ticket
      const [ticketResult] = await connection.query(
        `INSERT INTO TICKET (
          pnr_number, booking_date, journey_date, source_station, 
          destination_station, train_number, class_type, total_passengers, 
          total_fare, booking_status, booking_timestamp, booking_channel
        ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, 1, ?, 'CONFIRMED', NOW(), ?)`,
        [pnr, date, 'NDLS', 'HWH', trainNumber, classType, totalFare, paymentMode === 'Online' ? 'Online' : 'Counter']
      );

      // 5. Insert passenger ticket
      await connection.query(
        `INSERT INTO PASSENGER_TICKET (
          pnr_number, passenger_id, seat_number, coach_number, 
          reservation_status, is_primary_passenger
        ) VALUES (?, ?, NULL, NULL, 'CONFIRMED', TRUE)`,
        [pnr, passengerId]
      );

      // 6. Insert payment
      const [paymentResult] = await connection.query(
        `INSERT INTO PAYMENT (
          pnr_number, amount, payment_mode, payment_timestamp, 
          transaction_id, payment_status, gst_amount, service_charge
        ) VALUES (?, ?, ?, NOW(), ?, 'Success', ?, ?)`,
        [pnr, totalFare, paymentMode, `TXN${Date.now()}`, totalFare * 0.05, totalFare * 0.02]
      );

      // 7. Update train status
      await connection.query(
        `UPDATE TRAIN_STATUS 
         SET available_seats = available_seats - 1 
         WHERE train_number = ? AND journey_date = ? AND class_type = ?`,
        [trainNumber, date, classType]
      );

      // Commit the transaction
      await connection.commit();

      return NextResponse.json({
        success: true,
        pnr,
        message: 'Ticket booked successfully'
      });

    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to book ticket. Please try again.' },
      { status: 500 }
    );
  }
}

function generatePNR() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return timestamp.slice(-6) + random;
} 