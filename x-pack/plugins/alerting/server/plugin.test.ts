/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AlertingPlugin } from './plugin';
import { coreMock } from '../../../../src/core/server/mocks';
import { licensingMock } from '../../../plugins/licensing/server/mocks';
import { encryptedSavedObjectsMock } from '../../../plugins/encrypted_saved_objects/server/mocks';
import { taskManagerMock } from '../../task_manager/server/mocks';

describe('Alerting Plugin', () => {
  describe('setup()', () => {
    it('should log warning when Encrypted Saved Objects plugin is using an ephemeral encryption key', async () => {
      const context = coreMock.createPluginInitializerContext();
      const plugin = new AlertingPlugin(context);

      const coreSetup = coreMock.createSetup();
      const encryptedSavedObjectsSetup = encryptedSavedObjectsMock.createSetup();
      await plugin.setup(
        {
          ...coreSetup,
          http: {
            ...coreSetup.http,
            route: jest.fn(),
          },
        } as any,
        {
          licensing: licensingMock.createSetup(),
          encryptedSavedObjects: encryptedSavedObjectsSetup,
          taskManager: taskManagerMock.createSetup(),
        } as any
      );

      expect(encryptedSavedObjectsSetup.usingEphemeralEncryptionKey).toEqual(true);
      expect(context.logger.get().warn).toHaveBeenCalledWith(
        'APIs are disabled due to the Encrypted Saved Objects plugin using an ephemeral encryption key. Please set xpack.encryptedSavedObjects.encryptionKey in kibana.yml.'
      );
    });
  });

  describe('start()', () => {
    /**
     * HACK: This test has put together to ensuire the function "getAlertsClientWithRequest"
     * throws when needed. There's a lot of blockers for writing a proper test like
     * misisng plugin start/setup mocks for taskManager and actions plugin, core.http.route
     * is actually not a function in Kibana Platform, etc. This test contains what is needed
     * to get to the necessary function within start().
     */
    describe('getAlertsClientWithRequest()', () => {
      it('throws error when encryptedSavedObjects plugin has usingEphemeralEncryptionKey set to true', async () => {
        const context = coreMock.createPluginInitializerContext();
        const plugin = new AlertingPlugin(context);

        const coreSetup = coreMock.createSetup();
        const encryptedSavedObjectsSetup = encryptedSavedObjectsMock.createSetup();
        await plugin.setup(
          {
            ...coreSetup,
            http: {
              ...coreSetup.http,
              route: jest.fn(),
            },
          } as any,
          {
            licensing: licensingMock.createSetup(),
            encryptedSavedObjects: encryptedSavedObjectsSetup,
            taskManager: taskManagerMock.createSetup(),
          } as any
        );

        const startContract = plugin.start(
          coreMock.createStart() as any,
          {
            actions: {
              execute: jest.fn(),
              getActionsClientWithRequest: jest.fn(),
            },
          } as any
        );

        expect(encryptedSavedObjectsSetup.usingEphemeralEncryptionKey).toEqual(true);
        expect(() =>
          startContract.getAlertsClientWithRequest({} as any)
        ).toThrowErrorMatchingInlineSnapshot(
          `"Unable to create alerts client due to the Encrypted Saved Objects plugin using an ephemeral encryption key. Please set xpack.encryptedSavedObjects.encryptionKey in kibana.yml"`
        );
      });

      it(`doesn't throw error when encryptedSavedObjects plugin has usingEphemeralEncryptionKey set to false`, async () => {
        const context = coreMock.createPluginInitializerContext();
        const plugin = new AlertingPlugin(context);

        const coreSetup = coreMock.createSetup();
        const encryptedSavedObjectsSetup = {
          ...encryptedSavedObjectsMock.createSetup(),
          usingEphemeralEncryptionKey: false,
        };
        await plugin.setup(
          {
            ...coreSetup,
            http: {
              ...coreSetup.http,
              route: jest.fn(),
            },
          } as any,
          {
            licensing: licensingMock.createSetup(),
            encryptedSavedObjects: encryptedSavedObjectsSetup,
            taskManager: taskManagerMock.createSetup(),
          } as any
        );

        const startContract = plugin.start(
          coreMock.createStart() as any,
          {
            actions: {
              execute: jest.fn(),
              getActionsClientWithRequest: jest.fn(),
            },
            spaces: () => null,
          } as any
        );

        const fakeRequest = {
          headers: {},
          getBasePath: () => '',
          path: '/',
          route: { settings: {} },
          url: {
            href: '/',
          },
          raw: {
            req: {
              url: '/',
            },
          },
          getSavedObjectsClient: jest.fn(),
        };
        await startContract.getAlertsClientWithRequest(fakeRequest as any);
      });
    });
  });
});
