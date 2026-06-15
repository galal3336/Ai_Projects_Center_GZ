<?php

namespace App\Services\Security;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Spatie\Activitylog\Facades\LogActivity;

/**
 * Centralised security audit logging.
 * All security-relevant events (logins, authz failures, uploads, admin actions)
 * are written to the Spatie activity log AND the application security log channel.
 */
class AuditLogService
{
    public function __construct(private readonly ?Request $request = null) {}

    /**
     * Log a security event.
     *
     * @param string $event    Machine-readable event name, e.g. "login_success"
     * @param string $message  Human-readable description
     * @param array  $context  Extra key→value pairs attached to the log entry
     * @param mixed  $subject  Optional Eloquent model that is the subject
     */
    public function log(
        string $event,
        string $message,
        array  $context = [],
        mixed  $subject = null,
    ): void {
        $user   = Auth::user();
        $userId = $user?->id;
        $ip     = $this->request?->ip() ?? request()->ip();
        $ua     = $this->request?->userAgent() ?? request()->userAgent();
        $path   = $this->request?->path() ?? request()->path();

        $meta = array_merge([
            'event'      => $event,
            'ip'         => $ip,
            'user_agent' => $ua,
            'path'       => $path,
            'user_id'    => $userId,
        ], $context);

        // Write to application log (security channel or default)
        Log::channel(config('logging.security_channel', 'stack'))
            ->info("[AUDIT:{$event}] {$message}", $meta);

        // Write to Spatie activity log for admin visibility
        try {
            $activity = activity('security')
                ->withProperties($meta)
                ->event($event);

            if ($user) {
                $activity->causedBy($user);
            }

            if ($subject && is_object($subject) && method_exists($subject, 'getKey')) {
                $activity->performedOn($subject);
            }

            $activity->log($message);
        } catch (\Throwable $e) {
            // Activity log failure must never break the request
            Log::error('AuditLogService: failed to write Spatie activity log', [
                'error' => $e->getMessage(),
                'event' => $event,
            ]);
        }
    }

    // ─── Convenience methods for common security events ───────────────

    public function loginSuccess(mixed $user): void
    {
        $this->log('login_success', "User [{$user->email}] logged in successfully.", [], $user);
    }

    public function loginFailed(string $email): void
    {
        $this->log('login_failed', "Failed login attempt for email [{$email}].", ['attempted_email' => $email]);
    }

    public function logout(mixed $user): void
    {
        $this->log('logout', "User [{$user->email}] logged out.", [], $user);
    }

    public function authorizationDenied(string $ability, mixed $subject = null): void
    {
        $subjectDesc = $subject ? (is_object($subject) ? class_basename($subject) . '#' . (method_exists($subject, 'getKey') ? $subject->getKey() : '') : (string) $subject) : 'unknown';
        $this->log('authorization_denied', "Authorization denied for [{$ability}] on [{$subjectDesc}].", [
            'ability' => $ability,
            'subject' => $subjectDesc,
        ]);
    }

    public function fileUploaded(string $type, string $filename, ?string $subjectId = null): void
    {
        $this->log('file_uploaded', "File uploaded: [{$filename}] (type: {$type}).", [
            'file_type'  => $type,
            'filename'   => $filename,
            'subject_id' => $subjectId,
        ]);
    }

    public function fileUploadRejected(string $filename, string $reason): void
    {
        $this->log('file_upload_rejected', "File upload rejected: [{$filename}]. Reason: {$reason}.", [
            'filename' => $filename,
            'reason'   => $reason,
        ]);
    }

    public function adminAction(string $action, mixed $subject = null, array $extra = []): void
    {
        $subjectDesc = $subject ? (is_object($subject) ? class_basename($subject) . '#' . (method_exists($subject, 'getKey') ? $subject->getKey() : '') : (string) $subject) : 'unknown';
        $this->log('admin_action', "Admin action [{$action}] on [{$subjectDesc}].", array_merge([
            'action'  => $action,
            'subject' => $subjectDesc,
        ], $extra), $subject instanceof \Illuminate\Database\Eloquent\Model ? $subject : null);
    }

    public function projectStatusChanged(mixed $project, string $fromStatus, string $toStatus): void
    {
        $this->log('project_status_changed', "Project [{$project->id}] status changed [{$fromStatus}] → [{$toStatus}].", [
            'project_id'  => $project->id,
            'from_status' => $fromStatus,
            'to_status'   => $toStatus,
        ], $project);
    }

    public function suspiciousActivity(string $description, array $context = []): void
    {
        $this->log('suspicious_activity', $description, $context);
    }
}
