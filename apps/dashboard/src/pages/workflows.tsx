import { useEffect } from 'react';
import { RiRouteFill } from 'react-icons/ri';
import { WorkflowList } from '@/components/workflow-list';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/primitives/button';
import { OptInModal } from '@/components/opt-in-modal';
import { PageMeta } from '@/components/page-meta';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { Badge } from '@/components/primitives/badge';
import { WorkflowTemplateModal } from '@/components/template-store/workflow-template-modal';
import { CreateWorkflowButton } from '@/components/create-workflow-button';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FeatureFlagsKeysEnum } from '@novu/shared';

export const WorkflowsPage = () => {
  const track = useTelemetry();
  const isTemplateStoreEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_V2_TEMPLATE_STORE_ENABLED);

  useEffect(() => {
    track(TelemetryEvent.WORKFLOWS_PAGE_VISIT);
  }, [track]);

  return (
    <>
      <PageMeta title="Workflows" />
      <DashboardLayout
        headerStartItems={
          <h1 className="text-foreground-950 flex items-center gap-1">
            <span>Workflows</span>
            <Badge kind="pill" size="2xs">
              BETA
            </Badge>
          </h1>
        }
      >
        <OptInModal />
        <div className="flex justify-between px-2.5 py-2.5">
          <div className="invisible flex w-[20ch] items-center gap-2 rounded-lg bg-neutral-50 p-2"></div>

          {isTemplateStoreEnabled ? (
            <WorkflowTemplateModal asChild>
              <Button variant="primary" size="sm">
                <RiRouteFill className="size-4" />
                Create workflow
              </Button>
            </WorkflowTemplateModal>
          ) : (
            <CreateWorkflowButton asChild>
              <Button variant="primary" size="sm">
                <RiRouteFill className="size-4" />
                Create workflow
              </Button>
            </CreateWorkflowButton>
          )}
        </div>
        <WorkflowList />
      </DashboardLayout>
    </>
  );
};
