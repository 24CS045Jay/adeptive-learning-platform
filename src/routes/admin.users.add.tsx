import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { useState } from "react";
import { PageHeader, Card, PrimaryButton } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import { createUserWithDefaultPassword } from "@/lib/auth-store";

export const Route = createFileRoute("/admin/users/add")({
  component: AddUserPage,
});

const DEPARTMENTS = [
  { code: "CE", label: "Computer Engineering" },
  { code: "CSE", label: "Computer Science & Engineering" },
  { code: "IT", label: "Information Technology" },
  { code: "EC", label: "Electronics & Communication" },
  { code: "AIML", label: "AI & Machine Learning" },
];

type AccountRole = "Student" | "Faculty" | "Admin";

function AddUserPage() {
  const { addUser } = useAppData();
  const { user: adminUser } = useAuth();
  const adminDepartment = adminUser?.departmentId?.toUpperCase();
  const isSuperAdmin = String(adminUser?.role ?? "").toLowerCase() === "super_admin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AccountRole>("Student");
  const [department, setDepartment] = useState(adminDepartment ?? "CSE");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const departmentForStore = isSuperAdmin ? department : adminDepartment;
    if (!departmentForStore) {
      setError(
        "Your admin account is not assigned to a department. Ask a super admin to assign one.",
      );
      setLoading(false);
      return;
    }

    const roleForStore = role === "Student" ? "student" : role === "Faculty" ? "faculty" : "admin";
    const result = await createUserWithDefaultPassword(
      name.trim(),
      email.trim(),
      roleForStore,
      adminUser?.email ?? "admin@charusat.edu.in",
      adminUser?.token,
      departmentForStore,
    );

    if (!result.ok) {
      setError(result.error ?? "Account creation failed.");
      setLoading(false);
      return;
    }

    await addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: "active",
      passwordStatus: "default",
      departmentId: departmentForStore,
    });

    setSuccess(email.trim().toLowerCase());
    setName("");
    setEmail("");
    setLoading(false);
  };

  return (
    <div>
      <PageHeader
        title="Add New User"
        subtitle="Create a department-scoped student, faculty member, or admin account."
        action={
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:border-violet/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            User records
          </Link>
        }
      />

      <div className="mx-auto max-w-3xl">
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-success/30 bg-success/8 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div>
              <div className="font-semibold text-foreground">Account created successfully</div>
              <p className="mt-1 text-muted-foreground">
                {success} can sign in with the default password{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                  password1234
                </code>{" "}
                and must change it on first login.
              </p>
            </div>
          </div>
        )}

        <Card>
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/10 text-violet">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Account details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The account will be created inside the selected department scope.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                className="rounded-xl border border-border bg-background px-3.5 py-3 font-normal outline-none transition hover:border-violet/40 focus:border-violet focus:ring-2 focus:ring-violet/15"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@charusat.edu.in"
                required
                className="rounded-xl border border-border bg-background px-3.5 py-3 font-normal outline-none transition hover:border-violet/40 focus:border-violet focus:ring-2 focus:ring-violet/15"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
              Account type
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as AccountRole)}
                className="rounded-xl border border-border bg-background px-3.5 py-3 font-normal outline-none transition hover:border-violet/40 focus:border-violet"
              >
                <option>Student</option>
                <option>Faculty</option>
                <option>Admin</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
              Department
              {isSuperAdmin ? (
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="rounded-xl border border-border bg-background px-3.5 py-3 font-normal outline-none transition hover:border-violet/40 focus:border-violet"
                >
                  {DEPARTMENTS.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} · {item.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-xl border border-border bg-muted px-3.5 py-3 font-normal text-muted-foreground">
                  {adminDepartment ?? "Not assigned"}
                </div>
              )}
            </label>
            <div className="md:col-span-2 flex items-center justify-between gap-4 border-t border-border pt-5">
              <p className="text-xs text-muted-foreground">
                Default password:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                  password1234
                </code>
              </p>
              <PrimaryButton type="submit" icon={UserPlus} disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </PrimaryButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
