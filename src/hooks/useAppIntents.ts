import { useEffect, useCallback } from 'react';
import { App } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { useAutoImport } from './useAutoImport';
import { toast } from '@/hooks/use-toast';

export const useAppIntents = () => {
  const { processImportFile } = useAutoImport();

  const handleAppUrlOpen = useCallback(async (data: { url: string }) => {
    try {
      const url = data.url;
      
      // Check if it's a file intent
      if (url.includes('file://') || url.includes('content://')) {
        // Handle file sharing from other apps
        toast({
          title: "Fayl alındı",
          description: "Məlumat faylı analiz edilir...",
        });

        // Try to read the file
        try {
          let fileContent = '';
          
          if (Capacitor.isNativePlatform()) {
            // On native platforms, try to read from the URL
            const response = await fetch(url);
            fileContent = await response.text();
          }

          if (fileContent) {
            // Create a pseudo File object for processing
            const file = new File([fileContent], 'imported_data.json', { type: 'application/json' });
            await processImportFile(file);
          }
        } catch (error) {
          console.error('File reading error:', error);
          toast({
            title: "Fayl oxuna bilmədi",
            description: "Faylı manual olaraq seçməyi yoxlayın",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('App URL handling error:', error);
    }
  }, [processImportFile]);

  const handleAppStateChange = useCallback(async (state: { isActive: boolean }) => {
    if (state.isActive) {
      // App became active, check for any pending file intents
      if (process.env.NODE_ENV === 'development') {
        console.log('App became active');
      }
    }
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Listen for app URL opens (file sharing, deep links)
      App.addListener('appUrlOpen', handleAppUrlOpen);
      
      // Listen for app state changes
      App.addListener('appStateChange', handleAppStateChange);

      // Check if app was launched with a URL
      App.getLaunchUrl().then(result => {
        if (result && result.url) {
          handleAppUrlOpen({ url: result.url });
        }
      });

      return () => {
        App.removeAllListeners();
      };
    }
  }, [handleAppUrlOpen, handleAppStateChange]);

  const checkForSharedFiles = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        // Check app's temporary directory for shared files
        const files = await Filesystem.readdir({
          path: '',
          directory: Directory.Cache,
        });

        const jsonFiles = files.files.filter(file => 
          file.name.endsWith('.json') && file.name.includes('anbar')
        );

        for (const jsonFile of jsonFiles) {
          try {
            const fileContent = await Filesystem.readFile({
              path: jsonFile.name,
              directory: Directory.Cache,
              encoding: Encoding.UTF8,
            });

            const file = new File([fileContent.data], jsonFile.name, { type: 'application/json' });
            await processImportFile(file);

            // Clean up the processed file
            await Filesystem.deleteFile({
              path: jsonFile.name,
              directory: Directory.Cache,
            });

          } catch (error) {
            console.error('Error processing shared file:', error);
          }
        }
      } catch (error) {
        console.error('Error checking shared files:', error);
      }
    }
  }, [processImportFile]);

  return {
    checkForSharedFiles
  };
};