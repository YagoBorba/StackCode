<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    /**
     * Display the welcome page
     */
    public function index()
    {
        return view('welcome', [
            'projectName' => '{{projectName}}',
            'description' => '{{description}}'
        ]);
    }

    /**
     * API health check endpoint
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'message' => 'Application is running',
            'project' => '{{projectName}}',
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * API welcome endpoint
     */
    public function welcome(): JsonResponse
    {
        return response()->json([
            'message' => 'Welcome to {{projectName}}',
            'description' => '{{description}}',
            'version' => '1.0.0',
            'author' => '{{authorName}}'
        ]);
    }
}
