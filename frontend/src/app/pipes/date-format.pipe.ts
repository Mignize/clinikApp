import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  private datePipe = inject(DatePipe);
  transform(
    value: string | Date,
    format: string = "EEEE, d 'de' MMMM 'de' y - h:mm a",
    locale: string = 'es'
  ): string {
    return this.datePipe.transform(value, format, undefined, locale) || '';
  }
}
