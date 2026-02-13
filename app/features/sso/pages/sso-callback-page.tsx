import { CallbackErrorView } from "~/features/sso/components/callback-error-view";
import { CallbackProcessingView } from "~/features/sso/components/callback-processing-view";
import { RoleSelectionView } from "~/features/sso/components/role-selection-view";
import { useSsoCallback } from "~/features/sso/hooks/use-sso-callback";

export default function SsoCallbackPage() {
  const { error, isProcessing, loginModes, chooseMode } = useSsoCallback();

  if (error) {
    return <CallbackErrorView error={error} />;
  }

  if (loginModes.length > 1) {
    return (
      <RoleSelectionView loginModes={loginModes} onChooseMode={chooseMode} />
    );
  }

  return <CallbackProcessingView isProcessing={isProcessing} />;
}
