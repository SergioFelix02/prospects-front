import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { ProspectService } from '../../services/prospect.service';
import { Prospect } from '../../models/prospect';
import { ProspectLog } from '../../models/prospectLog';
declare var bootstrap: any;
import * as swal from 'sweetalert';

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

  public rejectNote: string = '';
  public commentError: boolean = false;
  private prospectToReject: any = [];
  public swal: any;

  public statuses: { [key: number]: string } = {
    1: 'Autorizado',
    2: 'Rechazado',
    3: 'Enviado'
  };

  constructor(
    private prospectService: ProspectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.swal = swal
  }

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
        this.swal({
          title: "Error",
          text: error.message,
          icon: "error",
        });
      }
    );
  }

  public authorizeProspect(prospect: Prospect): void {
    this.swal({
      title: "Autorizar Prospecto",
      text: "¿Estás seguro de que deseas autorizar el prospecto?",
      icon: "warning",
      buttons: ["Cancelar", "Autorizar"],
    }).then((confirm: boolean) => {
      if (confirm) {
        prospect.status = 1;
        this.prospectService.updateProspect(prospect).subscribe(
          (response: any) => {
            this.getProspects(this.page - 1);
            this.swal({
              title: "Éxito",
              text: response.message,
              icon: "success",
            });
          },
          (error: HttpErrorResponse) => {
            this.swal({
              title: "Error",
              text: error.message,
              icon: "error",
            });
          }
        );
      }
    });
  }

  public openRejectModal(prospect: Prospect): void {
    this.prospectToReject = prospect;
    this.rejectNote = '';
    this.commentError = false;

    const modalElement = document.getElementById('rejectNoteModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  public confirmRejection(): void {
    if (!this.rejectNote.trim()) {
      this.commentError = true;
      return;
    }
    this.swal({
      title: "Rechazar Prospecto",
      text: "¿Estás seguro de que deseas rechazar el prospecto?",
      icon: "warning",
      buttons: ["Cancelar", "Rechazar"],
      dangerMode: true,
    }).then((confirm: boolean) => {
      if (confirm) {
        this.prospectToReject.status = 2;
        this.prospectService.updateProspect(this.prospectToReject).subscribe(
          (response: any) => {
            let prospectLog: ProspectLog = {
              idProspect: this.prospectToReject?.idProspect,
              note: this.rejectNote,
              status: 1
            }
            this.prospectService.saveProspectLog(prospectLog).subscribe(
              (response: any) => {
                this.getProspects(this.page - 1);
                this.swal({
                  title: "Éxito",
                  text: response.message,
                  icon: "success",
                });
                const modalElement = document.getElementById('rejectNoteModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
              },
              (error: HttpErrorResponse) => {
                this.swal({
                  title: "Error",
                  text: error.message,
                  icon: "error",
                });
              }
            );
          },
          (error: HttpErrorResponse) => {
            this.swal({
              title: "Error",
              text: error.message,
              icon: "error",
            });
          }
        );
      }
    });
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
