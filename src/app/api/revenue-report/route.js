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
      const [rows] = await connection.query(`
        SELECT 
          t.pnr_number,
          t.booking_date,
          t.journey_date,
          t.train_number,
          tr.train_name,
          t.source_station,
          t.destination_station,
          t.class_type,
          t.total_passengers,
          tc.basic_fare * t.total_passengers as basic_fare,
          p.gst_amount,
          p.service_charge,
          (
            SELECT COALESCE(SUM(concession_amount), 0)
            FROM PASSENGER_TICKET
            WHERE pnr_number = t.pnr_number
          ) as concession_amount,
          t.total_fare,
          p.payment_mode,
          p.transaction_id,
          p.payment_status,
          p.payment_timestamp,
          pt.seat_number,
          pt.coach_number,
          pt.reservation_status,
          pa.name,
          TIMESTAMPDIFF(YEAR, pa.date_of_birth, CURDATE()) as age,
          pa.gender
        FROM TICKET t
        JOIN TRAIN tr ON t.train_number = tr.train_number
        JOIN TRAIN_CLASS tc ON t.train_number = tc.train_number AND t.class_type = tc.class_type
        JOIN PAYMENT p ON t.pnr_number = p.pnr_number
        JOIN PASSENGER_TICKET pt ON t.pnr_number = pt.pnr_number
        JOIN PASSENGER pa ON pt.passenger_id = pa.passenger_id
        WHERE t.pnr_number = ?
      `, [pnr]);

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'No ticket found with the given PNR' },
          { status: 404 }
        );
      }

      return NextResponse.json(rows[0]);

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}
