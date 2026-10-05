import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import emailjs from '@emailjs/browser';
emailjs.init("whYgOMU_1lsZs9PtH");

// Components
import { ContactComponent } from './components/contact.component';

@NgModule({
    declarations: [ContactComponent],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: ContactComponent }
        ])
    ]
})
export class ContactModule { }