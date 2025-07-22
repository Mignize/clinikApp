import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'scheduled':
        return 'Agendada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'pendiente':
        return 'Pendiente';
      default:
        return status;
    }
  }
}

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
