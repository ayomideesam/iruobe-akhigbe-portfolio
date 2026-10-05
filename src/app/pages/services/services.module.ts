import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

// Components
import { ServicesComponent } from './components/services.component';

@NgModule({
    declarations: [ServicesComponent],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
            { path: '', component: ServicesComponent }
        ])
    ]
})
export class ServicesModule { }
