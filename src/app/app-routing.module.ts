import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProspectComponent } from './prospect/prospect.component';
import { ProspectListComponent } from './prospect-list/prospect-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'prospects/index', pathMatch: 'full' },
  { path: 'prospects/index', component: ProspectListComponent },
  { path: 'prospects/create', component: ProspectComponent },
  { path: 'prospects/edit/:id', component: ProspectComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
