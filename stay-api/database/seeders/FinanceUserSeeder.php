<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FinanceUserSeeder extends Seeder
{
    public function run(): void
    {
        // Finance User
        User::create([
            'name' => 'Finance Officer PTPN IV',
            'email' => 'finance@stay.com',
            'password' => Hash::make('password'),
            'phone' => '081234567890',
            'role' => 'finance',
        ]);

        // Property Manager User
        User::create([
            'name' => 'Property Manager PTPN IV',
            'email' => 'manager@stay.com',
            'password' => Hash::make('password'),
            'phone' => '081234567891',
            'role' => 'property_manager',
        ]);

        // Customer User
        User::create([
            'name' => 'John Doe Customer',
            'email' => 'customer@stay.com',
            'password' => Hash::make('password'),
            'phone' => '081234567892',
            'role' => 'customer',
        ]);
    }
}
