<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get transaction reports list.
     */
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'roomType.property', 'payment']);

        // Date range filter
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->input('start_date') . ' 00:00:00',
                $request->input('end_date') . ' 23:59:59'
            ]);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Property filter
        if ($request->filled('property_id')) {
            $propertyId = $request->input('property_id');
            $query->whereHas('roomType', function ($q) use ($propertyId) {
                $q->where('property_id', $propertyId);
            });
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($reports);
    }

    /**
     * Export reports (CSV format).
     */
    public function export(Request $request)
    {
        $query = Booking::with(['user', 'roomType.property', 'payment']);

        // Apply filters (same as index)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->input('start_date') . ' 00:00:00',
                $request->input('end_date') . ' 23:59:59'
            ]);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('property_id')) {
            $propertyId = $request->input('property_id');
            $query->whereHas('roomType', function ($q) use ($propertyId) {
                $q->where('property_id', $propertyId);
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        $filename = "laporan-transaksi-" . date('Ymd-His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Booking Code', 'Tgl Transaksi', 'Nama Pelanggan', 'Properti', 
            'Tipe Kamar', 'Check-In', 'Check-Out', 'Jumlah Malam', 
            'Total Harga', 'Status Transaksi'
        ];

        $callback = function() use($bookings, $columns) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel formatting compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, $columns);

            foreach ($bookings as $booking) {
                fputcsv($file, [
                    $booking->booking_code,
                    $booking->created_at->toDateTimeString(),
                    $booking->guest_name,
                    $booking->roomType->property->name,
                    $booking->roomType->name,
                    $booking->check_in->toDateString(),
                    $booking->check_out->toDateString(),
                    $booking->nights,
                    $booking->total_price,
                    $booking->status
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
