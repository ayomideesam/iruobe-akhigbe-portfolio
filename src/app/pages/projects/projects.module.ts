import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Components
import { ProjectsComponent } from './components/projects.component';

@NgModule({
    declarations: [ProjectsComponent],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
            { path: '', component: ProjectsComponent }
        ])
    ]
})
export class ProjectsModule { }