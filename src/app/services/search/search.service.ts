import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../settings/settings.service';
import { Observable, of } from 'rxjs';
import { CORPORATION, CORP_TYPE } from '../../../app/typings/corporation';

@Injectable()
export class SearchService {
  public constructor(private http: HttpClient, public settings: SettingsService) {}

  get htdBaseUrl(): string {
    return 'https://704k2n7od3.execute-api.us-east-1.amazonaws.com/prod/jobs';
  }

  get staffAugBaseUrl(): string {
    // return 'http://localhost:3000/local/staffAug/jobs';
    return 'https://704k2n7od3.execute-api.us-east-1.amazonaws.com/prod/staffAug/jobs';
  }

  public getJobs(): Observable<any> {
    const params: any = {};
    const queryArray: string[] = [];
    params.active = 'true';

    for (let key in params) {
      queryArray.push(`${key}=${params[key]}`);
    }
    const queryString: string = queryArray.join('&');

    return this.http.get(`${this.htdBaseUrl}?${queryString}`);
  }

  public getSAJobs(): Observable<any> {
    const params: any = {};
    const queryArray: string[] = [];
    params.active = 'true';

    for (let key in params) {
      queryArray.push(`${key}=${params[key]}`);
    }
    const queryString: string = queryArray.join('&');

    return this.http.get(`${this.staffAugBaseUrl}?${queryString}`);
  }

  public openJob(id: string | number, corpType: CORP_TYPE = CORP_TYPE.APPRENTICESHIP): Observable<any> {
    const { baseUrl } = this.getServiceAndUrl(corpType);

    const url = `${baseUrl}/${id}`;
    return this.http.get(url);
  }

  public getCurrentJobIds(
    filter: any,
    ignoreFields: string[],
    corpType: CORP_TYPE = CORP_TYPE.APPRENTICESHIP
  ): Observable<any> {
    let queryArray: string[] = [];
    let params: any = {};

    params.query = `(isOpen:1) AND (isDeleted:0)${this.formatAdditionalCriteria(true)}${this.formatFilter(
      filter,
      true,
      ignoreFields
    )}`;
    params.count = `500`;
    params.fields = 'id';
    params.sort = 'id';

    for (let key in params) {
      queryArray.push(`${key}=${params[key]}`);
    }
    let queryString: string = queryArray.join('&');

    const { baseUrl: url } = this.getServiceAndUrl(corpType);

    return this.http.get(`${url}/search/JobOrder?${queryString}`);
  }

  public getAvailableFilterOptions(
    ids: number[],
    field: string,
    corpType: CORP_TYPE = CORP_TYPE.APPRENTICESHIP
  ): Observable<any> {
    let params: any = {};
    let queryArray: string[] = [];
    if (ids.length > 0) {
      params.where = `id IN (${ids.toString()})`;
      params.count = `500`;
      params.fields = `${field},count(id)`;
      params.groupBy = field;
      switch (field) {
        case 'publishedCategory(id,name)':
          params.orderBy = 'publishedCategory.name';
          break;
        case 'address(state)':
          params.orderBy = 'address.state';
          break;
        case 'address(city)':
          params.orderBy = 'address.city';
          break;
        default:
          params.orderBy = '-count.id';
          break;
      }
      for (let key in params) {
        queryArray.push(`${key}=${params[key]}`);
      }
      let queryString: string = queryArray.join('&');

      const { baseUrl: url } = this.getServiceAndUrl(corpType);

      return this.http.get(`${url}/query/JobBoardPost?${queryString}`); // tslint:disable-line
    } else {
      return of({ count: 0, start: 0, data: [] });
    }
  }

  private formatAdditionalCriteria(isSearch: boolean): string {
    let field: string = SettingsService.settings.additionalJobCriteria.field;
    let values: string[] = SettingsService.settings.additionalJobCriteria.values;
    let query: string = '';
    let delimiter: '"' | "'" = isSearch ? '"' : "'";
    let equals: ':' | '=' = isSearch ? ':' : '=';

    if (field && values.length > 0 && field !== '[ FILTER FIELD HERE ]' && values[0] !== '[ FILTER VALUE HERE ]') {
      for (let i: number = 0; i < values.length; i++) {
        if (i > 0) {
          query += ` OR `;
        } else {
          query += ' AND (';
        }
        query += `${field}${equals}${delimiter}${values[i]}${delimiter}`;
      }
      query += ')';
    }
    return query;
  }

  private formatFilter(filter: object, isSearch: boolean, ignoreFields: string[] = []): string {
    let additionalFilter: string = '';
    for (let key in filter) {
      if (!ignoreFields.includes(key)) {
        let filterValue: string | string[] = filter[key];
        if (typeof filterValue === 'string') {
          additionalFilter += ` AND (${filterValue})`;
        } else if (filterValue.length) {
          additionalFilter += ` AND (${filterValue.join(' OR ')})`;
        }
      }
    }

    return additionalFilter
      .replace(/{\?\^\^equals}/g, isSearch ? ':' : '=')
      .replace(/{\?\^\^delimiter}/g, isSearch ? '"' : "'");
  }

  private getServiceAndUrl(corpType: CORP_TYPE = CORP_TYPE.APPRENTICESHIP) {
    switch (corpType) {
      case CORP_TYPE.APPRENTICESHIP:
        return { service: SettingsService.settings[CORPORATION[corpType].serviceName], baseUrl: this.htdBaseUrl };
      case CORP_TYPE.STAFF_AUG:
        return { service: SettingsService.settings[CORPORATION[corpType].serviceName], baseUrl: this.staffAugBaseUrl };
    }
  }
}
