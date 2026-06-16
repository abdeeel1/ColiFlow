<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Key/value platform settings managed from the admin "Configuration Système".
 * Values are stored as strings and cast on read based on the key.
 */
class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    private const BOOL_KEYS = ['cin_verification_required', 'maintenance_mode'];
    private const NUM_KEYS  = ['platform_commission', 'withdrawal_threshold'];

    /** Default values used until an admin overrides them. */
    public static function defaults(): array
    {
        return [
            'platform_commission'       => 10,
            'withdrawal_threshold'      => 200,
            'support_email'             => 'support@coliflow.ma',
            'app_name'                  => 'ColiFlow Maroc',
            'default_currency'          => 'MAD',
            'cin_verification_required' => true,
            'maintenance_mode'          => false,
        ];
    }

    /** All settings (stored values merged over the defaults), correctly typed. */
    public static function allMerged(): array
    {
        $stored = static::pluck('value', 'key')->all();
        $out = [];
        foreach (static::defaults() as $key => $default) {
            $out[$key] = array_key_exists($key, $stored)
                ? static::castValue($key, $stored[$key])
                : $default;
        }
        return $out;
    }

    /** Read a single setting, falling back to its default. */
    public static function get(string $key, $fallback = null)
    {
        $stored = static::where('key', $key)->value('value');
        if ($stored === null) {
            return $fallback ?? (static::defaults()[$key] ?? null);
        }
        return static::castValue($key, $stored);
    }

    /** Persist a single setting (booleans stored as '1'/'0'). */
    public static function put(string $key, $value): void
    {
        $stored = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
        static::updateOrCreate(['key' => $key], ['value' => $stored]);
    }

    private static function castValue(string $key, $value)
    {
        if (in_array($key, self::BOOL_KEYS, true)) {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }
        if (in_array($key, self::NUM_KEYS, true)) {
            return is_numeric($value) ? $value + 0 : 0;
        }
        return $value;
    }
}
