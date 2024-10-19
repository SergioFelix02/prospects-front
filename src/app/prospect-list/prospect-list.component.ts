import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { ProspectService } from '../prospect.service';
import { Prospect } from '../prospect';
import { state } from '@angular/animations';

@Component({
  selector: 'app-prospect-list',
  templateUrl: './prospect-list.component.html',
  styleUrls: ['./prospect-list.component.css']
})
export class ProspectListComponent implements OnInit {
  public title = 'Prospectos';
  public prospects: Prospect[] = [];
  public activeTab: number = 1;
  public page: number = 1;
  public pageSize: number = 10;
  public total: number = 0;
  public totalPages: number = 0;
  public pages: number[] = [];

  public statuses: { [key: number]: string } = {
    1: 'Autorizado',
    2: 'Rechazado',
    3: 'Enviado'
  };

  constructor(
    private prospectService: ProspectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activeTab = this.route.snapshot.paramMap.get('activeTab') ? 2 : 1;
    this.getProspects(this.page - 1);
  }

  public getProspects(page: number): void {
    this.prospectService.getProspects(page, this.pageSize).subscribe(
      (response: any) => {
        this.prospects = response.data.content;
        this.pageSize = response.data.size;
        this.total = response.data.totalElements;
        this.totalPages = Math.ceil(this.total / this.pageSize);
        this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        console.log(error);
      }
    );
  }

  public changeStatus(prospect: Prospect, status: number): void {
    let flag = confirm("¿Estás seguro de que deseas " + (status == 1 ? 'autorizar' : 'rechazar') + " el prospecto?");
    if (flag) {
      prospect.status = status;
      this.prospectService.updateProspect(prospect).subscribe(
        (response: any) => {
          this.getProspects(this.page - 1);
          alert(response.message);
          // alert('Prospecto ' + (status == 1 ? 'autorizado' : 'rechazado') + ' con éxito');
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
          console.log(error);
        }
      );
    }

  }

  public createProspect(): void {
    this.router.navigate(['/prospects/create']);
  }

  public editProspect(idProspect: any): void {
    this.router.navigate(['/prospects/edit', idProspect]);
  }

  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.getProspects(this.page - 1);
    }
  }

  setActiveTab(tab: number) {
    this.activeTab = tab;
  }

  public getStatusString(status: any): string {
    return status !== undefined && this.statuses[status] ? this.statuses[status] : 'Desconocido';
  }

}
