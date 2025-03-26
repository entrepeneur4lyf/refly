import { useCallback } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
import { nodeOperationsEmitter } from '@refly-packages/ai-workspace-common/events/nodeOperations';

export const useCreateCodeArtifact = () => {
  const { t } = useTranslation();

  return useCallback(
    async (params?: {
      codeContent?: string;
      position?: { x: number; y: number };
      language?: string;
      type?: string;
      title?: string;
    }) => {
      const { codeContent, position, language, type, title } = params ?? {};

      // For code artifacts, we'll use a resource ID since there's no specific prefix for code artifacts
      const stopLoading = message.loading(t('codeArtifact.creating'));
      const { data, error } = await getClient().createCodeArtifact({
        body: {
          title: title ?? t('canvas.nodeTypes.codeArtifact', 'Code Artifact'),
          language: language ?? 'typescript',
          type: type ?? 'text/html',
          content: codeContent,
        },
      });
      stopLoading();

      if (!data?.success || error) {
        return;
      }

      nodeOperationsEmitter.emit('addNode', {
        node: {
          type: 'codeArtifact',
          data: {
            title: t('canvas.nodeTypes.codeArtifact', 'Code Artifact'),
            entityId: data?.data?.artifactId,
            metadata: {
              status: 'finish',
              language: 'typescript',
            },
          },
          position: position,
        },
        shouldPreview: true,
        needSetCenter: true,
      });
    },
    [t],
  );
};
