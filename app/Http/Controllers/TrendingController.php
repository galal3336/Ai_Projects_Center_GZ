<?php

namespace App\Http\Controllers;

use App\Services\TrendingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrendingController extends Controller
{
    public function __construct(private readonly TrendingService $trending) {}

    public function index(Request $request): Response
    {
        $window   = $request->query('window', '7d');
        $projects = $this->trending->getTrending(20, $window);

        return Inertia::render('Trending', [
            'projects' => $projects,
            'window'   => $window,
        ]);
    }

    public function api(Request $request): JsonResponse
    {
        $window   = $request->query('window', '7d');
        $limit    = min((int) $request->query('limit', 10), 50);
        $projects = $this->trending->getTrending($limit, $window);

        return response()->json(['data' => $projects]);
    }
}
