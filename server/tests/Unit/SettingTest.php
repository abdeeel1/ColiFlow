<?php

namespace Tests\Unit;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_falls_back_to_default_values(): void
    {
        // Nothing stored yet → the documented defaults are returned.
        $this->assertSame(10, Setting::get('platform_commission'));
        $this->assertFalse(Setting::get('maintenance_mode'));
        $this->assertSame('ColiFlow Maroc', Setting::get('app_name'));
    }

    public function test_it_persists_and_casts_a_boolean_setting(): void
    {
        Setting::put('maintenance_mode', true);

        // Stored as the string '1'…
        $this->assertDatabaseHas('settings', ['key' => 'maintenance_mode', 'value' => '1']);

        // …but read back as a real boolean.
        $this->assertTrue(Setting::get('maintenance_mode'));
    }

    public function test_it_casts_numeric_settings_to_numbers(): void
    {
        Setting::put('platform_commission', '15');

        $this->assertSame(15, Setting::get('platform_commission'));
    }

    public function test_merged_settings_include_every_default_key(): void
    {
        $merged = Setting::allMerged();

        foreach (array_keys(Setting::defaults()) as $key) {
            $this->assertArrayHasKey($key, $merged);
        }
    }
}
