// app/api/search-trains/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';


// Helper function to filter trains based on search criteria
function filterTrains(source, destination, date, travelClass) {
  // Filter by source and destination (case-insensitive)
  let filteredTrains = trainSchedules.filter(train => 
    train.source.toLowerCase() === source.toLowerCase() && 
    train.destination.toLowerCase() === destination.toLowerCase()
  );

  // If travel class is specified, filter by available class
  if (travelClass && travelClass !== 'any') {
    filteredTrains = filteredTrains.filter(train => 
      train.class.includes(travelClass.toLowerCase())
    );
  }

  // Add the date to each train (not filtering by date in this mock implementation)
  return filteredTrains.map(train => ({
    ...train,
    date
  }));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    const classType = searchParams.get('class');

    if (!source || !destination || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the day of the week for the journey date
    const journeyDate = new Date(date);
    const dayOfWeek = journeyDate.getDay();
    const dayColumn = `runs_on_${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek]}`;

    // Base query to find trains running between source and destination
    let query = `
      SELECT 
        t.train_number,
        t.train_name,
        t.train_type,
        rs1.arrival_time as source_arrival,
        rs1.departure_time as source_departure,
        rs2.arrival_time as dest_arrival,
        rs2.departure_time as dest_departure,
        r.total_distance,
        r.total_stops,
        GROUP_CONCAT(
          CONCAT(
            tc.class_type, '|',
            tc.basic_fare, '|',
            COALESCE(ts.available_seats, tc.total_seats), '|',
            COALESCE(ts.rac_seats, 0), '|',
            COALESCE(ts.waitlist_count, 0)
          )
        ) as class_info
      FROM TRAIN t
      JOIN ROUTE r ON t.train_number = r.train_number
      JOIN ROUTE_STATION rs1 ON r.route_id = rs1.route_id
      JOIN ROUTE_STATION rs2 ON r.route_id = rs2.route_id
      JOIN TRAIN_CLASS tc ON t.train_number = tc.train_number
      LEFT JOIN TRAIN_STATUS ts ON t.train_number = ts.train_number 
        AND ts.journey_date = ? 
        AND tc.class_type = ts.class_type
      WHERE rs1.station_code = ? 
        AND rs2.station_code = ?
        AND rs1.stop_number < rs2.stop_number
        AND t.${dayColumn} = TRUE
    `;

    const params = [date, source, destination];

    if (classType) {
      query += ` AND tc.class_type = ?`;
      params.push(classType);
    }

    query += ` GROUP BY t.train_number, t.train_name, t.train_type, rs1.arrival_time, rs1.departure_time, rs2.arrival_time, rs2.departure_time, r.total_distance, r.total_stops
               ORDER BY rs1.departure_time`;

    const [trains] = await pool.query(query, params);

    // Format the response
    const formattedTrains = trains.map(train => {
      const classes = train.class_info.split(',').map(classInfo => {
        const [classType, fare, availableSeats, racSeats, waitlistCount] = classInfo.split('|');
        return {
          classType,
          fare: parseFloat(fare),
          availableSeats: parseInt(availableSeats),
          racSeats: parseInt(racSeats),
          waitlistCount: parseInt(waitlistCount)
        };
      });

      return {
        trainNumber: train.train_number,
        trainName: train.train_name,
        trainType: train.train_type,
        departureTime: train.source_departure,
        arrivalTime: train.dest_arrival,
        duration: calculateDuration(train.source_departure, train.dest_arrival),
        distance: train.total_distance,
        totalStops: train.total_stops,
        classes: classes
      };
    });

    return NextResponse.json({ trains: formattedTrains });
  } catch (error) {
    console.error('Error searching trains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateDuration(departure, arrival) {
  const depTime = new Date(`2000-01-01T${departure}`);
  const arrTime = new Date(`2000-01-01T${arrival}`);
  
  // Handle overnight journeys
  if (arrTime < depTime) {
    arrTime.setDate(arrTime.getDate() + 1);
  }
  
  const diffMs = arrTime - depTime;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

// Handle POST requests (for more complex search criteria)
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Extract search parameters from request body
    const { source, destination, date, class: travelClass, passengers } = body;
    
    // Validate required parameters
    if (!source || !destination || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters. Please provide source, destination, and date.' },
        { status: 400 }
      );
    }
    
    // Simulate a slight delay as if we're fetching from a real API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get filtered trains based on search criteria
    const trains = filterTrains(source, destination, date, travelClass);
    
    // Calculate total price based on passenger count
    const trainsWithTotalPrice = trains.map(train => ({
      ...train,
      totalPrice: (train.price * parseInt(passengers || 1)).toFixed(2)
    }));
    
    // Return the results
    return NextResponse.json({
      success: true,
      data: {
        trains: trainsWithTotalPrice,
        searchCriteria: {
          source,
          destination,
          date,
          class: travelClass,
          passengers: parseInt(passengers || 1)
        },
        count: trainsWithTotalPrice.length
      }
    });
  } catch (error) {
    console.error('Error processing search request:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}