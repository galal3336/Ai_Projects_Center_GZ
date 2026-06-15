<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Resources\CreditsResource;
use App\Models\CreditsMember;
use App\Services\Security\AuditLogService;
use App\Services\Security\FileUploadSecurityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CreditsController extends Controller
{
    public function __construct(
        private readonly FileUploadSecurityService $uploadSecurity,
        private readonly AuditLogService $audit,
    ) {}

    public function index(): Response
    {
        $members = CreditsMember::orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Credits/Index', [
            'members' => CreditsResource::collection($members),
            'stats'   => [
                'total'               => CreditsMember::count(),
                'active'              => CreditsMember::where('is_active', true)->count(),
                'featured'            => CreditsMember::where('is_featured', true)->count(),
                'development_team'    => CreditsMember::where('category', 'development_team')->count(),
                'faculty_supervisors' => CreditsMember::where('category', 'faculty_supervisors')->count(),
                'contributors'        => CreditsMember::where('category', 'contributors')->count(),
                'sponsors'            => CreditsMember::where('category', 'sponsors')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage();

        $data = $request->validate([
            'name'              => ['required', 'string', 'max:150'],
            'name_ar'           => ['nullable', 'string', 'max:150'],
            'title'             => ['required', 'string', 'max:150'],
            'title_ar'          => ['nullable', 'string', 'max:150'],
            'bio'               => ['nullable', 'string', 'max:500'],
            'bio_ar'            => ['nullable', 'string', 'max:500'],
            'email'             => ['nullable', 'email', 'max:150'],
            'linkedin_url'      => ['nullable', 'url', 'max:255'],
            'github_url'        => ['nullable', 'url', 'max:255'],
            'website_url'       => ['nullable', 'url', 'max:255'],
            'type'              => ['required', 'string', 'in:developer,designer,supervisor,advisor,contributor,alumni'],
            'category'          => ['required', 'string', 'in:development_team,faculty_supervisors,contributors,sponsors'],
            'contribution_year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'is_active'         => ['boolean'],
            'is_featured'       => ['boolean'],
            'sort_order'        => ['nullable', 'integer', 'min:0'],
        ]);

        // Auto-assign sort_order after last in category
        if (! isset($data['sort_order'])) {
            $data['sort_order'] = CreditsMember::where('category', $data['category'])->max('sort_order') + 1;
        }

        CreditsMember::create($data);

        return back()->with('success', 'Member added successfully.');
    }

    public function update(Request $request, CreditsMember $credit): RedirectResponse
    {
        $this->authorizeManage();

        $data = $request->validate([
            'name'              => ['sometimes', 'required', 'string', 'max:150'],
            'name_ar'           => ['nullable', 'string', 'max:150'],
            'title'             => ['sometimes', 'required', 'string', 'max:150'],
            'title_ar'          => ['nullable', 'string', 'max:150'],
            'bio'               => ['nullable', 'string', 'max:500'],
            'bio_ar'            => ['nullable', 'string', 'max:500'],
            'email'             => ['nullable', 'email', 'max:150'],
            'linkedin_url'      => ['nullable', 'url', 'max:255'],
            'github_url'        => ['nullable', 'url', 'max:255'],
            'website_url'       => ['nullable', 'url', 'max:255'],
            'type'              => ['sometimes', 'string', 'in:developer,designer,supervisor,advisor,contributor,alumni'],
            'category'          => ['sometimes', 'string', 'in:development_team,faculty_supervisors,contributors,sponsors'],
            'contribution_year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'is_active'         => ['boolean'],
            'is_featured'       => ['boolean'],
            'sort_order'        => ['nullable', 'integer', 'min:0'],
        ]);

        $credit->update($data);

        return back()->with('success', 'Member updated successfully.');
    }

    public function destroy(CreditsMember $credit): RedirectResponse
    {
        $this->authorizeManage();

        $credit->delete();

        return back()->with('success', 'Member removed successfully.');
    }

    public function reorder(Request $request): JsonResponse
    {
        $this->authorizeManage();

        $items = $request->validate([
            'items'              => ['required', 'array'],
            'items.*.id'         => ['required', 'uuid', 'exists:credits_members,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ])['items'];

        foreach ($items as $item) {
            CreditsMember::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Order saved.']);
    }

    public function uploadAvatar(Request $request, CreditsMember $credit): JsonResponse
    {
        $this->authorizeManage();

        $request->validate([
            'avatar' => ['required', 'file', 'mimes:jpeg,png,webp', 'max:2048'],
        ]);

        $file = $request->file('avatar');

        try {
            $this->uploadSecurity->validateImage($file, 2048);
        } catch (\InvalidArgumentException $e) {
            $this->audit->fileUploadRejected($file->getClientOriginalName(), $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 422);
        }

        // Delete old avatar if it was a stored upload
        if ($credit->avatar && str_starts_with($credit->avatar, 'credits/')) {
            Storage::disk('public')->delete($credit->avatar);
        }

        $safeName = $this->uploadSecurity->sanitizeFilename($file);
        $path     = $file->storeAs('credits/avatars', $safeName, 'public');

        $credit->update(['avatar' => $path]);

        $this->audit->fileUploaded('avatar', $file->getClientOriginalName(), $credit->id);

        return response()->json(['avatar' => Storage::disk('public')->url($path)]);
    }

    private function authorizeManage(): void
    {
        abort_unless(
            auth()->user()?->hasPermissionTo(Permission::ManageCredits->value),
            403
        );
    }
}
