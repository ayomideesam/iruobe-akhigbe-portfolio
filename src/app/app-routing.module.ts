import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectivePreloadStrategy } from './core/services/selective-preload.strategy';

// `preload: true` marks a route worth fetching in the background once the current
// page has settled. Services and Projects are the two routes a visitor most often
// opens next, and both are small. Resume is deliberately excluded: its chunk drags
// in the PDF toolchain (jspdf + html2canvas + canvg ≈ 770 KB raw) which is only
// needed if someone actually downloads the CV.
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module')
      .then(m => m.HomeModule)
  },
  {
    path: 'services',
    data: { preload: true },
    loadChildren: () => import('./pages/services/services.module')
      .then(m => m.ServicesModule)
  },
  {
    path: 'resume',
    loadChildren: () => import('./pages/resume/resume.module')
      .then(m => m.ResumeModule)
  },
  {
    path: 'projects',
    data: { preload: true },
    loadChildren: () => import('./pages/projects/projects.module')
      .then(m => m.ProjectsModule)
  },
  {
    path: 'contact',
    data: { preload: true },
    loadChildren: () => import('./pages/contact/contact.module')
      .then(m => m.ContactModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: SelectivePreloadStrategy,
      initialNavigation: 'enabledBlocking',
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
