import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage, getFieldErrors } from "@/lib/getErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { FormField, TextInput } from "@/components/ui/FormField";

export function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const changePasswordMutation = useMutation({
    mutationFn: async () => apiClient.post("/auth/change-password", { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setFieldErrors({});
    },
    onError: (err) => {
      const errors = getFieldErrors(err);
      setFieldErrors(errors ?? {});
      toast.error(getErrorMessage(err, "Failed to change password"));
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    changePasswordMutation.mutate();
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy">Settings</h1>
        <p className="text-sm text-text-secondary">Your account details and security.</p>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Profile</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Name</dt>
            <dd className="text-text-primary">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Email</dt>
            <dd className="text-text-primary">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Role</dt>
            <dd className="text-text-primary">{user?.role.replace("_", " ")}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-text-muted">To update your profile details, contact a Super Admin.</p>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Current Password" htmlFor="currentPassword" required error={fieldErrors.currentPassword}>
            <TextInput
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </FormField>
          <FormField
            label="New Password"
            htmlFor="newPassword"
            required
            hint="At least 8 characters, with upper/lowercase and a number."
            error={fieldErrors.newPassword}
          >
            <TextInput id="newPassword" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </FormField>

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary disabled:opacity-60"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
