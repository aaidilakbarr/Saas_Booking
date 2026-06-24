<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get finance dashboard statistics.
     */
    public function index(Request $request)
    {
        // 1. Transaction counters
        $confirmedCount = Booking::whereIn('status', ['confirmed', 'checked_in', 'checked_out'])->count();
        $pendingCount = Booking::where('status', 'payment_uploaded')->count();
        $rejectedCount = Booking::where('status', 'rejected')->count();
        $expiredCount = Booking::where('status', 'expired')->count();

        // 2. Revenue (confirmed transactions)
        $totalRevenue = Booking::whereIn('status', ['confirmed', 'checked_in', 'checked_out'])->sum('total_price');

        $thisMonthRevenue = Booking::whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('total_price');

        // 3. Daily transaction stats (last 14 days)
        $dailyTransactions = Booking::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count'),
                DB::raw('SUM(total_price) as volume')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(14))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        // 4. Monthly transactions (last 6 months)
        $monthlyRevenue = Booking::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(total_price) as total')
            )
            ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // 5. Queue counts
        $queueCount = Booking::where('status', 'payment_uploaded')->count();

        return response()->json([
            'stats' => [
                'transactions_confirmed' => $confirmedCount,
                'transactions_pending' => $pendingCount,
                'transactions_rejected' => $rejectedCount,
                'transactions_expired' => $expiredCount,
                'revenue_total' => (float)$totalRevenue,
                'revenue_this_month' => (float)$thisMonthRevenue,
                'queue_count' => $queueCount,
            ],
            'daily_transactions' => $dailyTransactions,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }
}
