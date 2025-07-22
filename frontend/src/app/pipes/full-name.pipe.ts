import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullName',
  standalone: true,
})
export class FullNamePipe implements PipeTransform {
  transform(user: { firstName?: string; lastName?: string }): string {
    if (!user) return '';
    const { firstName = '', lastName = '' } = user;
    return `${firstName} ${lastName}`.trim();
  }
}
