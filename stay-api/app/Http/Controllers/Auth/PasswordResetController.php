<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link email.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $email = $request->email;
        $token = Str::random(60);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Insert new token
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        $resetUrl = "http://localhost:5173/reset-password?token={$token}&email=" . urlencode($email);

        // Send email (using Mail::send or simple raw template logged in log)
        Mail::raw("Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda. Silakan klik link berikut untuk mereset password Anda: {$resetUrl}. Link ini akan kadaluarsa dalam waktu 60 menit.", function ($message) use ($email) {
            $message->to($email)
                ->subject('Reset Password Stay');
        });

        return response()->json([
            'message' => 'Tautan atur ulang kata sandi telah dikirim ke email Anda.'
        ]);
    }

    /**
     * Reset password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record) {
            return response()->json(['message' => 'Token reset password tidak valid.'], 400);
        }

        // Check token expiration (60 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Token reset password sudah kadaluarsa.'], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token reset password tidak cocok.'], 400);
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Kata sandi Anda berhasil diperbarui.'
        ]);
    }
}
