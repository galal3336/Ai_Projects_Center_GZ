<?php

namespace App\Http\Controllers;

use App\Http\Resources\TechnologyResource;
use App\Models\Technology;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TechnologyController extends Controller
{
    public function index(): Response
    {
        $this->authorize('manage', Technology::class);

        $technologies = Technology::orderBy('category')->orderBy('name')->get();

        return Inertia::render('Admin/Technologies/Index', [
            'technologies' => TechnologyResource::collection($technologies),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('manage', Technology::class);

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:technologies,name'],
            'slug'        => ['nullable', 'string', 'max:100'],
            'category'    => ['required', 'string', 'max:50'],
            'icon'        => ['nullable', 'string', 'max:50'],
            'color'       => ['nullable', 'string', 'max:7'],
            'website_url' => ['nullable', 'url'],
        ]);

        $data['slug'] = $data['slug'] ?? \Illuminate\Support\Str::slug($data['name']);

        Technology::create($data);

        return redirect()->back()->with('success', __('technologies.created'));
    }

    public function update(Request $request, Technology $technology): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('manage', Technology::class);

        $data = $request->validate([
            'name'        => ['sometimes', 'required', 'string', 'max:100'],
            'category'    => ['sometimes', 'required', 'string', 'max:50'],
            'icon'        => ['nullable', 'string', 'max:50'],
            'color'       => ['nullable', 'string', 'max:7'],
            'website_url' => ['nullable', 'url'],
            'is_active'   => ['nullable', 'boolean'],
        ]);

        $technology->update($data);

        return redirect()->back()->with('success', __('technologies.updated'));
    }

    public function destroy(Technology $technology): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('manage', Technology::class);

        $technology->delete();

        return redirect()->back()->with('success', __('technologies.deleted'));
    }

    public function apiList(): \Illuminate\Http\JsonResponse
    {
        $technologies = Technology::where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'category', 'icon', 'color']);

        return response()->json(TechnologyResource::collection($technologies));
    }
}
