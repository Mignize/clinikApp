import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleLabel',
  standalone: true,
})
export class RoleLabelPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'admin':
        return 'Administrador';
      case 'doctor':
        return 'Doctor';
      case 'patient':
        return 'Paciente';
      default:
        return value;
    }
  }
}
