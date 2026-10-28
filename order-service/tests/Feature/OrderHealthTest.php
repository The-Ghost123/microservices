<?php

namespace Tests\Feature;

use Tests\TestCase;

class OrderHealthTest extends TestCase
{
    /**
     * Test endpoint GET /health mengembalikan status 200 dan service name.
     */
    public function test_health_check_returns_ok(): void
    {
        $response = $this->getJson('/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'service' => 'order-service',
            ]);
    }
}
