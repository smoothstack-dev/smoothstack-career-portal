import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../settings/settings.service';
import { Observable } from 'rxjs';

@Injectable()
export class ApplyService {
  public constructor(private http: HttpClient, public settings: SettingsService) {}
  get baseUrl(): string {
    return 'http://localhost:3000/local/careers';
  }

  public apply(id: number, params: any, formData: FormData): Observable<any> {
    let applyParams: any = this.assembleParams(params);

    return this.http.post(`${this.baseUrl}/${id}?${applyParams}`, formData);
  }

  private assembleParams(data: any): string {
    let params: string[] = [];
    for (let key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }
      if (!data[key]) {
        continue;
      }
      let value: any = data[key];
      params.push(`${key}=${value}`);
    }
    return params.join('&');
  }
}
