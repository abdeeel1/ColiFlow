<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * When maintenance mode is on, block write operations (CRUD) for everyone
 * except admins. Read requests stay available so the site is still browsable.
 */
class EnsureNotInMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        $isWrite = ! in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true);
        $isAdmin = $request->user() && $request->user()->role === 'admin';

        if ($isWrite && ! $isAdmin && Setting::get('maintenance_mode')) {
            return response()->json([
                'message' => 'Le site est en maintenance. Les opérations sont temporairement indisponibles.',
                'maintenance' => true,
            ], 503);
        }

        return $next($request);
    }
}
