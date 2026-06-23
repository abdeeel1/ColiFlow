<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_area(): void
    {
        $this->getJson('/api/admin/settings')->assertUnauthorized();
    }

    public function test_regular_user_is_forbidden_from_admin_area(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'user']));

        $this->getJson('/api/admin/settings')->assertForbidden();
    }

    public function test_admin_can_access_admin_area(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/admin/settings')
            ->assertOk()
            ->assertJsonStructure(['settings' => ['app_name', 'maintenance_mode']]);
    }
}
