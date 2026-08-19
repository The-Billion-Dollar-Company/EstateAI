import {
  Building2,
  CalendarClock,
  CheckCircle2,
  EyeOff,
  Link as LinkIcon,
  Star,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { StatCard } from '@/components/dashboard/StatCard';
import { PriceTag } from '@/components/property/PriceTag';
import { StatusBadge } from '@/components/property/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAdminDeleteProperty,
  useAdminProperties,
  useAdminStats,
  useAdminUsers,
  useApproveProperty,
  useDeleteUser,
  useRejectProperty,
  useUnpublishProperty,
} from '@/hooks/queries/use-admin';
import { apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

type ConfirmAction =
  | { type: 'approve'; id: string; title: string }
  | { type: 'reject'; id: string; title: string }
  | { type: 'unpublish'; id: string; title: string }
  | { type: 'republish'; id: string; title: string }
  | { type: 'delete-property'; id: string; title: string }
  | { type: 'delete-user'; id: string; name: string };

export function AdminPage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isPending: statsPending } = useAdminStats();
  const { data: properties = [], isPending: propsPending } = useAdminProperties();
  const { data: users = [], isPending: usersPending } = useAdminUsers();
  const approveProperty = useApproveProperty();
  const rejectProperty = useRejectProperty();
  const unpublishProperty = useUnpublishProperty();
  const deleteProperty = useAdminDeleteProperty();
  const deleteUser = useDeleteUser();
  const [tab, setTab] = useState('pending');
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  const pendingProperties = properties.filter((p) => p.status === 'pending');
  const isLoading =
    approveProperty.isPending ||
    rejectProperty.isPending ||
    unpublishProperty.isPending ||
    deleteProperty.isPending ||
    deleteUser.isPending;

  const executeConfirm = (): void => {
    if (!confirm) return;
    if (confirm.type === 'approve') {
      approveProperty.mutate(confirm.id, {
        onSuccess: () => { toast.success('Property approved and is now live'); setConfirm(null); },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not approve')),
      });
    } else if (confirm.type === 'reject') {
      rejectProperty.mutate(confirm.id, {
        onSuccess: () => { toast.success('Property rejected and removed'); setConfirm(null); },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not reject')),
      });
    } else if (confirm.type === 'unpublish') {
      unpublishProperty.mutate(confirm.id, {
        onSuccess: () => { toast.success('Property unpublished'); setConfirm(null); },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not unpublish')),
      });
    } else if (confirm.type === 'republish') {
      approveProperty.mutate(confirm.id, {
        onSuccess: () => { toast.success('Property is live again'); setConfirm(null); },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not republish')),
      });
    } else if (confirm.type === 'delete-property') {
      deleteProperty.mutate(confirm.id, {
        onSuccess: () => { toast.success('Property permanently deleted'); setConfirm(null); },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not delete property')),
      });
    } else if (confirm.type === 'delete-user') {
      deleteUser.mutate(confirm.id, {
        onSuccess: () => { toast.success('User deleted'); setConfirm(null); },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not delete user')),
      });
    }
  };

  const confirmProps = confirm
    ? confirm.type === 'approve'
      ? { title: 'Approve property?', description: `"${confirm.title}" will go live on the platform.`, confirmLabel: 'Approve', confirmVariant: 'default' as const }
      : confirm.type === 'reject'
      ? { title: 'Reject & delete property?', description: `"${confirm.title}" will be permanently removed. This cannot be undone.`, confirmLabel: 'Reject', confirmVariant: 'destructive' as const }
      : confirm.type === 'unpublish'
      ? { title: 'Unpublish property?', description: `"${confirm.title}" will be hidden from the public but not deleted.`, confirmLabel: 'Unpublish', confirmVariant: 'destructive' as const }
      : confirm.type === 'republish'
      ? { title: 'Republish property?', description: `"${confirm.title}" will be visible to the public again.`, confirmLabel: 'Republish', confirmVariant: 'default' as const }
      : confirm.type === 'delete-property'
      ? { title: 'Delete property permanently?', description: `"${confirm.title}" and all its bookings/reviews will be removed. This cannot be undone.`, confirmLabel: 'Delete', confirmVariant: 'destructive' as const }
      : { title: 'Delete user?', description: `Delete "${(confirm as Extract<ConfirmAction, { type: 'delete-user' }>).name}"? This also removes their listings and bookings. Cannot be undone.`, confirmLabel: 'Delete', confirmVariant: 'destructive' as const }
    : null;

  const statCards = stats
    ? [
        { icon: Users, label: 'Total users', value: stats.totalUsers },
        { icon: Building2, label: 'Active listings', value: stats.activeListings },
        { icon: CalendarClock, label: 'Pending approvals', value: stats.pendingApprovals },
        { icon: Star, label: 'Total reviews', value: stats.totalReviews },
      ]
    : [];

  return (
    <div className="container py-8 md:py-12">
      <PageHeader
        eyebrow="Administration"
        title="Platform overview"
        description={`Welcome, ${user?.name ?? 'admin'}. Review listings, moderate users, and keep the marketplace healthy.`}
      />

      {/* Confirm dialog */}
      {confirmProps && (
        <ConfirmDialog
          open={Boolean(confirm)}
          onOpenChange={(open) => { if (!open) setConfirm(null); }}
          title={confirmProps.title}
          description={confirmProps.description}
          confirmLabel={confirmProps.confirmLabel}
          confirmVariant={confirmProps.confirmVariant}
          loading={isLoading}
          onConfirm={executeConfirm}
        />
      )}

      {/* Stats */}
      <div className="mb-10 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsPending
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-6 h-8 w-14" />
              </div>
            ))
          : statCards.map(({ icon, label, value }) => (
              <StatCard key={label} icon={icon} label={label} value={value} />
            ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingProperties.length})
          </TabsTrigger>
          <TabsTrigger value="all-properties">All Properties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Pending approvals */}
        <TabsContent value="pending" className="mt-6">
          {propsPending ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : pendingProperties.length === 0 ? (
            <EmptyState icon={CheckCircle2} message="No pending properties. All caught up!" />
          ) : (
            <div className="space-y-3">
              {pendingProperties.map((property) => (
                <div
                  key={property.id}
                  className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{property.title}</p>
                      <Badge variant="outline" className="shrink-0 capitalize">{property.type}</Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {property.location.area}, {property.location.city}
                    </p>
                    <PriceTag
                      amount={property.price}
                      listingType={property.listingType}
                      className="mt-2.5 block text-lg"
                    />
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button asChild size="sm" variant="ghost" className="gap-1">
                      <Link to={`/properties/${property.id}`} target="_blank">
                        <LinkIcon size={14} />
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setConfirm({ type: 'approve', id: property.id, title: property.title })}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirm({ type: 'reject', id: property.id, title: property.title })}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <XCircle size={14} />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* All properties */}
        <TabsContent value="all-properties" className="mt-6">
          {propsPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : properties.length === 0 ? (
            <EmptyState icon={Building2} message="No properties yet." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[46rem] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Title</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Location</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Price</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Status</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id} className="border-b last:border-0">
                      <td className="max-w-[220px] px-5 py-4">
                        <Link
                          to={`/properties/${property.id}`}
                          className="line-clamp-1 font-medium hover:text-primary hover:underline"
                          target="_blank"
                        >
                          {property.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {property.location.area}, {property.location.city}
                      </td>
                      <td className="px-5 py-4">
                        <PriceTag amount={property.price} listingType={property.listingType} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={property.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex gap-1">
                          {property.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirm({ type: 'approve', id: property.id, title: property.title })}
                                disabled={isLoading}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setConfirm({ type: 'reject', id: property.id, title: property.title })}
                                disabled={isLoading}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {property.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => setConfirm({ type: 'unpublish', id: property.id, title: property.title })}
                              disabled={isLoading}
                            >
                              <EyeOff size={14} />
                              Unpublish
                            </Button>
                          )}
                          {property.status === 'inactive' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => setConfirm({ type: 'republish', id: property.id, title: property.title })}
                              disabled={isLoading}
                            >
                              <CheckCircle2 size={14} />
                              Republish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => setConfirm({ type: 'delete-property', id: property.id, title: property.title })}
                            disabled={isLoading}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-6">
          {usersPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : users.length === 0 ? (
            <EmptyState icon={Users} message="No users found." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[46rem] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Email</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Role</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Joined</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="px-5 py-4 font-medium">{u.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={u.role === 'admin' ? 'default' : u.role === 'owner' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {u.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setConfirm({ type: 'delete-user', id: u.id, name: u.name })}
                            disabled={isLoading}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
