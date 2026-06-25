<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Public\PropertyController as PublicPropertyController;
use App\Http\Controllers\Public\ReviewController as PublicReviewController;
use App\Http\Controllers\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Customer\PaymentController as CustomerPaymentController;
use App\Http\Controllers\Manager\PropertyController as ManagerPropertyController;
use App\Http\Controllers\Manager\RoomTypeController as ManagerRoomTypeController;
use App\Http\Controllers\Manager\BookingController as ManagerBookingController;
use App\Http\Controllers\Manager\DashboardController as ManagerDashboardController;
use App\Http\Controllers\Finance\PaymentController as FinancePaymentController;
use App\Http\Controllers\Finance\ReportController as FinanceReportController;
use App\Http\Controllers\Finance\DashboardController as FinanceDashboardController;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);

// Public Property / Directory routes
Route::get('/properties', [PublicPropertyController::class, 'index']);
Route::get('/properties/{slug}', [PublicPropertyController::class, 'show']);
Route::get('/properties/{slug}/availability', [PublicPropertyController::class, 'availability']);
Route::get('/properties/{slug}/reviews', [PublicPropertyController::class, 'reviews']);

Route::get('/bank-accounts', function() {
    return response()->json(BankAccount::where('is_active', true)->get());
});

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth Profile
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/profile', [AuthController::class, 'updateProfile']); // POST to allow multipart form data for file uploads in PHP
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Customer Roles
    Route::middleware('role:customer')->group(function () {
        Route::post('/bookings', [CustomerBookingController::class, 'store']);
        Route::get('/bookings', [CustomerBookingController::class, 'index']);
        Route::get('/bookings/{booking_code}', [CustomerBookingController::class, 'show']);
        Route::delete('/bookings/{booking_code}', [CustomerBookingController::class, 'destroy']);
        
        Route::post('/bookings/{booking_code}/payment', [CustomerPaymentController::class, 'uploadPaymentProof']);
        Route::post('/bookings/{booking_code}/review', [PublicReviewController::class, 'store']);
    });

    // Property Manager Roles
    Route::middleware('role:property_manager')->group(function () {
        Route::get('/manager/properties', [ManagerPropertyController::class, 'index']);
        Route::post('/manager/properties', [ManagerPropertyController::class, 'store']);
        Route::get('/manager/properties/{id}', [ManagerPropertyController::class, 'show']);
        Route::post('/manager/properties/{id}', [ManagerPropertyController::class, 'update']); // POST to handle file upload updates in PHP
        Route::delete('/manager/properties/{id}', [ManagerPropertyController::class, 'destroy']);
        Route::post('/manager/properties/{id}/images', [ManagerPropertyController::class, 'uploadImages']);
        Route::delete('/manager/properties/{propertyId}/images/{imageId}', [ManagerPropertyController::class, 'deleteImage']);

        Route::get('/manager/properties/{id}/room-types', [ManagerRoomTypeController::class, 'index']);
        Route::post('/manager/properties/{id}/room-types', [ManagerRoomTypeController::class, 'store']);
        Route::post('/manager/room-types/{id}', [ManagerRoomTypeController::class, 'update']); // POST to handle updates with multipart form data
        Route::delete('/manager/room-types/{id}', [ManagerRoomTypeController::class, 'destroy']);
        Route::post('/manager/room-types/{id}/images', [ManagerRoomTypeController::class, 'uploadImages']);
        Route::get('/manager/dashboard', [ManagerDashboardController::class, 'index']);
    });

    // Shared Booking Routes (Property Manager & Finance)
    Route::middleware('role:property_manager,finance')->group(function () {
        Route::get('/manager/bookings', [ManagerBookingController::class, 'index']);
        Route::get('/manager/bookings/{booking_code}', [ManagerBookingController::class, 'show']);
        Route::put('/manager/bookings/{booking_code}/check-in', [ManagerBookingController::class, 'checkIn']);
        Route::put('/manager/bookings/{booking_code}/check-out', [ManagerBookingController::class, 'checkOut']);
    });

    // Finance Roles
    Route::middleware('role:finance')->group(function () {
        Route::get('/finance/payments', [FinancePaymentController::class, 'index']);
        Route::get('/finance/payments/{id}', [FinancePaymentController::class, 'show']);
        Route::put('/finance/payments/{id}/confirm', [FinancePaymentController::class, 'confirm']);
        Route::put('/finance/payments/{id}/reject', [FinancePaymentController::class, 'reject']);

        Route::get('/finance/reports', [FinanceReportController::class, 'index']);
        Route::get('/finance/reports/export', [FinanceReportController::class, 'export']);

        Route::get('/finance/dashboard', [FinanceDashboardController::class, 'index']);
    });
});
