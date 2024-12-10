import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useCookie } from 'react-use';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { getWsServerOrigin } from '@refly-packages/utils/url';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

interface CanvasContextType {
  canvasId: string;
  provider: HocuspocusProvider;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export const CanvasProvider = ({ canvasId, children }: { canvasId: string; children: React.ReactNode }) => {
  const [token] = useCookie('_refly_ai_sid');

  // Create a Yjs document
  const ydoc = useMemo(() => new Y.Doc(), [canvasId]);

  // Set up IndexedDB persistence
  useEffect(() => {
    const indexeddbProvider = new IndexeddbPersistence(canvasId, ydoc);
    indexeddbProvider.once('synced', () => {
      console.log('Content has been loaded from IndexedDB for canvasId:', canvasId);
    });

    return () => {
      indexeddbProvider.destroy();
    };
  }, [canvasId, ydoc]);

  const provider = useMemo(() => {
    return new HocuspocusProvider({
      url: getWsServerOrigin(),
      name: canvasId,
      token,
      document: ydoc, // Use the Yjs document
    });
  }, [canvasId, token, ydoc]);

  useEffect(() => {
    return () => {
      if (provider) {
        provider.forceSync();
        provider.destroy();
      }
    };
  }, [canvasId, token, provider]);

  // Add null check before rendering
  if (!provider) {
    return null;
  }

  return <CanvasContext.Provider value={{ canvasId, provider }}>{children}</CanvasContext.Provider>;
};

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
};
