import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { HttpClientModule } from '@angular/common/http';
import { ProspectService } from './services/prospect.service';
import { ProspectComponent } from './components/prospect/prospect.component';
import { ProspectListComponent } from './components/prospect-list/prospect-list.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    ProspectComponent,
    ProspectListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule
  ],
  providers: [ProspectService],
  bootstrap: [AppComponent],
})
export class AppModule { }
