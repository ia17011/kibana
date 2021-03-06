/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Plugin, CoreStart, CoreSetup } from 'kibana/public';
import { MlDependencies } from './application/app';

export class MlPlugin implements Plugin<Setup, Start> {
  setup(core: CoreSetup, { data, security, licensing }: MlDependencies) {
    core.application.register({
      id: 'ml',
      title: 'Machine learning',
      async mount(context, params) {
        const [coreStart, depsStart] = await core.getStartServices();
        const { renderApp: renderMlApp } = await import('./application/app');
        return renderMlApp(coreStart, depsStart, {
          element: params.element,
          appBasePath: params.appBasePath,
          onAppLeave: params.onAppLeave,
          history: params.history,
          data,
          security,
          licensing,
        });
      },
    });

    return {};
  }

  start(core: CoreStart, deps: any) {
    return {};
  }
  public stop() {}
}

export type Setup = ReturnType<MlPlugin['setup']>;
export type Start = ReturnType<MlPlugin['start']>;
