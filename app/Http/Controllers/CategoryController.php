<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('projects')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('manage', Category::class);

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:150'],
            'name_ar'     => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:500'],
            'description_ar' => ['nullable', 'string', 'max:500'],
            'parent_id'   => ['nullable', 'uuid', 'exists:categories,id'],
            'icon'        => ['nullable', 'string', 'max:50'],
            'color'       => ['nullable', 'string', 'max:7'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        $data['slug'] = \Illuminate\Support\Str::slug($data['name']);

        Category::create($data);
        Cache::tags(['categories', 'search', 'facets'])->flush();

        return redirect()->back()->with('success', __('categories.created'));
    }

    public function update(Request $request, Category $category): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('manage', Category::class);

        $data = $request->validate([
            'name'           => ['sometimes', 'required', 'string', 'max:150'],
            'name_ar'        => ['sometimes', 'required', 'string', 'max:150'],
            'description'    => ['nullable', 'string', 'max:500'],
            'description_ar' => ['nullable', 'string', 'max:500'],
            'icon'           => ['nullable', 'string', 'max:50'],
            'color'          => ['nullable', 'string', 'max:7'],
            'sort_order'     => ['nullable', 'integer', 'min:0'],
            'is_active'      => ['nullable', 'boolean'],
        ]);

        $category->update($data);
        Cache::tags(['categories', 'search', 'facets'])->flush();

        return redirect()->back()->with('success', __('categories.updated'));
    }

    public function destroy(Category $category): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('manage', Category::class);

        $category->delete();
        Cache::tags(['categories', 'search', 'facets'])->flush();

        return redirect()->back()->with('success', __('categories.deleted'));
    }

    public function apiList(): \Illuminate\Http\JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'name_ar', 'slug', 'icon', 'color', 'parent_id']);

        return response()->json(CategoryResource::collection($categories));
    }
}
