import { PageMeta } from '@/components/page-meta';
import { ApiServiceLevelEnum } from '@novu/shared';
import { useEffect } from 'react';
import { CreateEnvironmentButton } from '../components/create-environment-button';
import { DashboardLayout } from '../components/dashboard-layout';
import { EnvironmentsList } from '../components/environments-list';
import { FreeTierEmptyState } from '../components/free-tier-empty-state';
import { useFetchSubscription } from '../hooks/use-fetch-subscription';
import { useTelemetry } from '../hooks/use-telemetry';
import { TelemetryEvent } from '../utils/telemetry';

export function EnvironmentsPage() {
  const track = useTelemetry();
  const { subscription } = useFetchSubscription();

  const isPaidTier =
    subscription?.apiServiceLevel === ApiServiceLevelEnum.BUSINESS ||
    subscription?.apiServiceLevel === ApiServiceLevelEnum.ENTERPRISE;
  const isTrialActive = subscription?.trial?.isActive;
  const canAccessEnvironments = !isPaidTier && !isTrialActive;

  useEffect(() => {
    track(TelemetryEvent.ENVIRONMENTS_PAGE_VIEWED);
  }, [track]);

  return (
    <>
      <PageMeta title={`Environments`} />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Environments</h1>}>
        {canAccessEnvironments ? (
          <div className="flex flex-col justify-between gap-2 px-2.5 py-2.5">
            <div className="flex justify-end">
              <CreateEnvironmentButton />
            </div>
            <EnvironmentsList />
          </div>
        ) : (
          <FreeTierEmptyState />
        )}
      </DashboardLayout>
    </>
  );
}
