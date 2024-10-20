import { Prospect } from '../../models/prospect';
import { ProspectLog } from '../../models/prospectLog';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProspectService } from '../../services/prospect.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
declare var bootstrap: any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-prospect',
  templateUrl: './prospect.component.html',
  styleUrls: ['./prospect.component.css']
})

export class ProspectComponent implements OnInit {
  public prospect: Prospect;
  public prospectLogs: ProspectLog[] = [];
  public isEdit: boolean = false;
  public title = "";
  public files: any = [];
  public uploadedFiles: File[] = [];
  public imageUrl: SafeUrl = "";
  public fileType: string = "";

  @ViewChild('previewModal') previewModal!: ElementRef;

  constructor(
    private prospectService: ProspectService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.prospect = {
      name: '',
      lastName: '',
      secondLastName: '',
      phoneNumber: '',
      status: 3
    };
  }

  ngOnInit(): void {
    this.getProspect();
  }

  public getProspect(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    if (id) {
      this.isEdit = true;
      this.prospectService.getProspectById(id).subscribe(
        (response: any) => {
          this.prospect = response.data;
          this.files = response.files;
          this.getProspectLogs(id);
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
          });
        }
      );
    }
    this.title = this.isEdit ? 'Prospecto' : 'Nuevo Prospecto';
  }

  public onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files) as File[];
      selectedFiles.forEach(async (file) => {
        if (file.size > 4 * 1024 * 1024) {
          Swal.fire({
            title: "Error",
            text: "El archivo es demasiado grande. Debe ser menor de 4MB.",
            icon: "error",
          });
          return;
        }
        this.uploadedFiles.push(file);
        this.files.push({
          file: file,
          type: file.type
        });
      });
    }
  }

  public removeFile(index: number): void {
    Swal.fire({
      title: "Eliminar archivo",
      text: "¿Estás seguro de que deseas eliminar el archivo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.files.splice(index, 1);
        this.uploadedFiles.splice(index, 1);
      }
    });
  }

  public saveProspect(form: NgForm): void {
    if (form.valid) {
      Swal.fire({
        title: "Guardar prospecto",
        text: "¿Estás seguro de que deseas guardar el prospecto?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.uploadedFiles.length == 0) {
            Swal.fire({
              title: "Error",
              text: "Debe cargar al menos un archivo",
              icon: "error",
            });
            return;
          }
          this.prospectService.saveProspect(this.prospect, this.uploadedFiles).subscribe(
            (response: any) => {
              this.router.navigate(['/prospects/index']);
              Swal.fire({
                title: "Éxito",
                text: response.message,
                icon: "success",
              });
            },
            (error: HttpErrorResponse) => {
              Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
              });
            }
          );
        }
      });
    }
  }

  public previewFile(file: any): void {
    if (file.idProspectFile) {
      const idProspectFile = file.idProspectFile;
      this.prospectService.previewFile(idProspectFile).subscribe(
        (blob: Blob) => {
          const previewUrl = URL.createObjectURL(blob);
          this.fileType = blob.type;
          if (this.fileType.includes('image') || this.fileType === 'application/pdf') {
            this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
          } else {
            this.imageUrl = "";
            Swal.fire({
              title: "Vista previa no disponible",
              text: "Solo se pueden previsualizar imágenes y PDFs.",
              icon: "warning",
            });
            return;
          }
          const modalElement = this.previewModal.nativeElement;
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            title: "Error",
            text: "No se pudo cargar la vista previa del archivo.",
            icon: "error",
          });
        }
      );
    } else {
      const previewUrl = URL.createObjectURL(file.file);
      this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
      this.fileType = file.type;
      if (this.fileType.includes('image') || this.fileType === 'application/pdf') {
        this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
      } else {
        this.imageUrl = "";
        Swal.fire({
          title: "Vista previa no disponible",
          text: "Solo se pueden previsualizar imágenes y PDFs.",
          icon: "warning",
        });
        return;
      }
      const modalElement = this.previewModal.nativeElement;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  public getProspectLogs(prospectId: number): void {
    this.prospectService.getProspectLogs(prospectId).subscribe(
      (prospectLogs: any) => {
        this.prospectLogs = prospectLogs.data;
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
        });
      }
    );
  }

  public goBack(): void {
    if (this.isEdit) {
      this.router.navigate(['/prospects/index']);
    } else {
      Swal.fire({
        title: "Volver",
        text: "¿Estás seguro de que deseas volver?, se perderá toda la información capturada",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Volver",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/prospects/index']);
        }
      });
    }
  }
}
