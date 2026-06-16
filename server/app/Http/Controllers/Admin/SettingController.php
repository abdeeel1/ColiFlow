<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

/**
 * "Configuration Système" — read and persist the platform's general settings.
 */
class SettingController extends Controller
{
    /** Admin: full settings payload for the configuration page. */
    public function index()
    {
        return response()->json(['settings' => Setting::allMerged()]);
    }

    /** Admin: persist the general settings. */
    public function update(Request $request)
    {
        $data = $request->validate([
            'platform_commission'       => ['required', 'numeric', 'min:0', 'max:100'],
            'withdrawal_threshold'      => ['required', 'numeric', 'min:0'],
            'support_email'             => ['required', 'email', 'max:255'],
            'app_name'                  => ['required', 'string', 'max:255'],
            'default_currency'          => ['required', 'string', 'max:10'],
            'cin_verification_required' => ['required', 'boolean'],
            'maintenance_mode'          => ['required', 'boolean'],
        ]);

        foreach ($data as $key => $value) {
            Setting::put($key, $value);
        }

        return response()->json([
            'message'  => 'Paramètres enregistrés avec succès.',
            'settings' => Setting::allMerged(),
        ]);
    }

    /** Public: the subset of settings the SPA needs on every load. */
    public function appConfig()
    {
        return response()->json([
            'app_name'                  => Setting::get('app_name'),
            'default_currency'          => Setting::get('default_currency'),
            'platform_commission'       => Setting::get('platform_commission'),
            'maintenance_mode'          => Setting::get('maintenance_mode'),
            'cin_verification_required' => Setting::get('cin_verification_required'),
        ]);
    }
}
