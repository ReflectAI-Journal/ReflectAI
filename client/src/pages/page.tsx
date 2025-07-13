import { Suspense } from 'react'
import { Plans } from '@/components/dashboard/billing/plans/plans'
import { Subscriptions } from '@/components/dashboard/billing/subscription/subscriptions'
import { DashboardContent } from '@/components/dashboard/content'

export const dynamic = 'force-dynamic'

export default function BillingPage() {
  return (
    <DashboardContent title="Billing" subtitle="View and manage your billing information.">
      <div className="space-y-6">
        <Suspense fallback={<div>Loading subscriptions...</div>}>
          <Subscriptions />
        </Suspense>
        <Suspense fallback={<div>Loading plans...</div>}>
          <Plans />
        </Suspense>
      </div>
    </DashboardContent>
  )
}