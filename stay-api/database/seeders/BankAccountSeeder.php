<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use Illuminate\Database\Seeder;

class BankAccountSeeder extends Seeder
{
    public function run(): void
    {
        BankAccount::create([
            'bank_name' => 'Bank Mandiri',
            'account_number' => '1112223334445',
            'account_name' => 'PTPN IV STAY BOOKING',
            'is_active' => true,
        ]);

        BankAccount::create([
            'bank_name' => 'Bank Rakyat Indonesia (BRI)',
            'account_number' => '5556667778889',
            'account_name' => 'PTPN IV STAY BOOKING',
            'is_active' => true,
        ]);
    }
}
