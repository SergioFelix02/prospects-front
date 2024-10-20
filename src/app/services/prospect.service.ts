import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from 'rxjs';
import { Prospect } from '../models/prospect';
import { ProspectLog } from '../models/prospectLog';

@Injectable({
  providedIn: 'root'
})
export class ProspectService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  public getProspects(page: number, pageSize: number): Observable<Prospect[]> {
    return this.http.get<Prospect[]>(`${this.apiUrl}/prospect/all?page=${page}&pageSize=${pageSize}`);
  }

  public getProspectById(id: number): Observable<Prospect[]> {
    return this.http.get<Prospect[]>(`${this.apiUrl}/prospect/find/${id}`);
  }

  public saveProspect(prospect: Prospect, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('prospect', new Blob([JSON.stringify(prospect)], { type: 'application/json' }));
    files.forEach((file, index) => {
      formData.append('files', file, file.name);
    });
    return this.http.post<any>(`${this.apiUrl}/prospect/save`, formData);
  }

  public updateProspect(prospect: Prospect): Observable<Prospect> {
    return this.http.put<Prospect>(`${this.apiUrl}/prospect/update`, prospect);
  }

  public deleteProspect(prospectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/prospect/delete/${prospectId}`);
  }

  public previewFile(idProspectFile: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/prospect/file/preview/${idProspectFile}`, { responseType: 'blob' });
  }

  public saveProspectLog(prospectLog: ProspectLog): Observable<ProspectLog> {
    return this.http.post<ProspectLog>(`${this.apiUrl}/prospect/logs/save`, prospectLog);
  }

  public getProspectLogs(prospectId: number): Observable<ProspectLog[]> {
    return this.http.get<ProspectLog[]>(`${this.apiUrl}/prospect/logs/${prospectId}`);
  }

}
