import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'myaw-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.is-finished]': 'isFinished()',
  },
})
export class MyawLoaderComponent {
  readonly isFinished = input<boolean>(false);
  readonly label = input<string>('Loading');
  readonly finishedLabel = input<string>('Completed');

  protected readonly ariaLabel = computed(() =>
    this.isFinished() ? this.finishedLabel() : this.label(),
  );
}
