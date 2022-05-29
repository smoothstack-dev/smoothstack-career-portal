import { SettingsService } from '../services/settings/settings.service';
export enum CORP_TYPE {
  STAFF_AUG = 'STAFF_AUG',
  APPRENTICESHIP = 'APPRENTICESHIP',
}

export const CORPORATION = {
  STAFF_AUG: {
    serviceName: 'staffAugService',
    corpId: '8yy144',
  },
  APPRENTICESHIP: {
    serviceName: 'service',
    corpId: '7xjpg0',
  },
};

export const getCorpTypeByCorpId = (corpId: string): CORP_TYPE => {
  if (corpId === CORPORATION.STAFF_AUG.corpId) return CORP_TYPE.STAFF_AUG;
  else return CORP_TYPE.APPRENTICESHIP;
};
