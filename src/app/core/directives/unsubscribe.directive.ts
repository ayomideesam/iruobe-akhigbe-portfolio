import { Directive, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Directive({
    standalone: true,
    selector: "[appSubscriptionManagement]",
})
export class SubscriptionManagementDirective implements OnDestroy {
    protected unSubscribe = new Subject<void>();

    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }
}