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

export const workAuthorizationMap = {
  STAFF_AUG: [
    { label: 'Yes - US Citizen', value: 'US Citizen' },
    { label: 'Yes - Permanent Resident', value: 'Permanent Resident' },
    { label: 'Yes - DACA', value: 'DACA' },
    { label: 'Yes - H-1B', value: 'H-1B' },
    { label: 'Yes - GC/EAD', value: 'GC/EAD' },
    { label: 'Yes - OPT/EAD', value: 'OPT/EAD' },
    { label: 'Yes - EAD', value: 'EAD' },
    { label: 'Yes - H-4/EAD', value: 'H-4/EAD' },
    { label: 'Yes - TN Visa', value: 'TN Visa' },
    { label: 'Yes - Other', value: 'Other' },
    { label: 'No', value: 'Not Authorized' },
  ],
  APPRENTICESHIP: [
    { label: 'Yes - US Citizen', value: 'US Citizen' },
    { label: 'Yes - Permanent Resident', value: 'Permanent Resident' },
    { label: 'Yes - DACA', value: 'DACA' },
    { label: 'Yes - H-1B', value: 'H-1B' },
    { label: 'Yes - OPT/EAD', value: 'OPT/EAD' },
    { label: 'Yes - EAD', value: 'EAD' },
    { label: 'Yes - H-4/EAD', value: 'H-4/EAD' },
    { label: 'Yes - Other', value: 'Other' },
    { label: 'No', value: 'Not Authorized' },
  ],
};
