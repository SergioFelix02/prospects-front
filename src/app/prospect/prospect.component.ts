import { Prospect } from './../prospect';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProspectService } from '../prospect.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
declare var bootstrap: any;

@Component({
  selector: 'app-prospect',
  templateUrl: './prospect.component.html',
  styleUrls: ['./prospect.component.css']
})

export class ProspectComponent implements OnInit {

  public prospect: Prospect;
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.prospectService.getProspectById(parseInt(id, 10)).subscribe(
        (response: any) => {
          this.prospect = response.data;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
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
          alert("El archivo es demasiado grande. Debe ser menor de 4MB.");
          return;
        }
        this.uploadedFiles.push(file);
        this.files.push({
          file: file,
        });
      });
    }
  }

  public saveProspect(form: NgForm): void {
    if (form.valid) {
      const flag = confirm("¿Estás seguro de que deseas guardar el prospecto?");
      if (flag) {
        this.prospectService.saveProspect(this.prospect, this.uploadedFiles).subscribe(
          (response: any) => {
            console.log(response);
            this.router.navigate(['/prospects/index', { activeTab: 2 }]);
            alert(response.message);
          },
          (error: HttpErrorResponse) => {
            alert(error.message);
            console.log(error);
          }
        );
      }
    }
  }

  public previewFile(file: any): void {
    const previewUrl = URL.createObjectURL(file);
    this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
    this.fileType = file.type;
    const modalElement = this.previewModal.nativeElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  public goBack(): void {
    if (this.isEdit) {
      this.router.navigate(['/prospects/index']);
    } else {
      const flag = confirm("¿Estás seguro de que deseas volver?, se perderá toda la información capturada");
      if (flag) {
        this.router.navigate(['/prospects/index']);
      }
    }
  }

}
