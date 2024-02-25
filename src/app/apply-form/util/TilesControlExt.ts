import { NovoControlConfig, TilesControl } from 'novo-elements';

export type ToolTipConfig = {
  // https://bullhorn.github.io/novo-elements/docs/#/design/iconography
  icon: string;
  // https://bullhorn.github.io/novo-elements/docs/#/design/colors
  size: string;
  content: any;
};
export type NovoControlConfigExt = NovoControlConfig & { extLabel?: string; extToolTip?: ToolTipConfig };

export class TilesControlExt extends TilesControl {
  constructor(config: NovoControlConfigExt) {
    super(config);
  }
}
